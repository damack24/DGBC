import express from "express";
import db from "../db.js";

const router = express.Router();
const COOLDOWN_MINUTES = 10; // Example cooldown time

// Fetch missions and user data
router.get("/", async (req, res) => {
  const wallet = req.query.wallet;

  try {
    const [missions] = await db.query("SELECT * FROM missions ORDER BY id ASC");

    let userData = {};
    let completedMissions = [];

    if (wallet) {
      const [users] = await db.query("SELECT LST, SAINT FROM users WHERE wallet = ?", [wallet]);
      if (users.length > 0) userData = users[0];

      const [completed] = await db.query(
        "SELECT mission_id, completed_at FROM user_missions WHERE wallet = ? AND status = 'completed'",
        [wallet]
      );
      completedMissions = completed.map(row => ({
        id: row.mission_id,
        completed_at: row.completed_at
      }));
    }

    const missionsWithStatus = missions.map(m => {
      const completed = completedMissions.find(c => c.id === m.id);
      let onCooldown = false;
      if (completed) {
        const lastTime = new Date(completed.completed_at).getTime();
        const now = Date.now();
        const diffMinutes = (now - lastTime) / 60000;
        onCooldown = diffMinutes < COOLDOWN_MINUTES;
      }
      return {
        ...m,
        completed: !!completed,
        onCooldown
      };
    });

    res.json({ success: true, missions: missionsWithStatus, user: userData });
  } catch (err) {
    console.error("Error fetching missions:", err);
    res.status(500).json({ success: false, error: "Failed to fetch missions" });
  }
});

// Complete a mission
router.post("/complete", async (req, res) => {
  const { wallet, mission_id } = req.body;
  if (!wallet || !mission_id)
    return res.status(400).json({ success: false, error: "wallet and mission_id required" });

  try {
    const [missionRows] = await db.query("SELECT * FROM missions WHERE id = ?", [mission_id]);
    if (missionRows.length === 0)
      return res.status(404).json({ success: false, error: "Mission not found" });

    const mission = missionRows[0];

    const [existing] = await db.query(
      "SELECT * FROM user_missions WHERE wallet = ? AND mission_id = ?",
      [wallet, mission_id]
    );

    if (existing.length > 0 && existing[0].status === "completed") {
      const lastTime = new Date(existing[0].completed_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - lastTime) / 60000;
      if (diffMinutes < COOLDOWN_MINUTES) {
        return res.json({
          success: false,
          message: `Mission is on cooldown. Try again in ${Math.ceil(COOLDOWN_MINUTES - diffMinutes)} minutes.`
        });
      }
    }

    // Reward calculation
    const multiplier = 1 + mission.difficulty * 0.2;
    const rewardAmount = Math.floor(mission.reward_amount * multiplier);

    if (existing.length === 0) {
      await db.query(
        "INSERT INTO user_missions (wallet, mission_id, status, completed_at) VALUES (?, ?, 'completed', CURRENT_TIMESTAMP)",
        [wallet, mission_id]
      );
    } else {
      await db.query(
        "UPDATE user_missions SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE wallet = ? AND mission_id = ?",
        [wallet, mission_id]
      );
    }

    // Ensure only valid token columns are updated
    const validTokens = ["LST", "SAINT"];
    const tokenColumn = validTokens.includes(mission.reward_token) ? mission.reward_token : "LST";

    await db.query(
      `UPDATE users SET ${tokenColumn} = ${tokenColumn} + ? WHERE wallet = ?`,
      [rewardAmount, wallet]
    );

    console.log(`✅ ${wallet} completed mission: ${mission.name} | Reward: ${rewardAmount} ${tokenColumn}`);

    res.json({
      success: true,
      message: `Mission '${mission.name}' completed! You earned ${rewardAmount} ${tokenColumn}.`,
      reward_token: tokenColumn,
      reward_amount: rewardAmount
    });
  } catch (err) {
    console.error("Mission completion error:", err);
    res.status(500).json({ success: false, error: "Failed to complete mission" });
  }
});

// Manual LST → $SAINT conversion
router.post("/convert", async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ success: false, error: "Wallet required" });

  try {
    const [users] = await db.query("SELECT LST, SAINT FROM users WHERE wallet = ?", [wallet]);
    if (users.length === 0) return res.status(404).json({ success: false, error: "User not found" });

    const user = users[0];
    const LST = user.LST || 0;
    if (LST < 100) return res.json({ success: false, message: "Not enough LST to convert (min 100)" });

    const convertRate = 100; // 100 LST = 1 SAINT
    const addedSAINT = Math.floor(LST / convertRate);
    const usedLST = addedSAINT * convertRate;

    await db.query(
      "UPDATE users SET LST = LST - ?, SAINT = SAINT + ? WHERE wallet = ?",
      [usedLST, addedSAINT, wallet]
    );

    console.log(`💰 ${wallet} converted ${usedLST} LST → ${addedSAINT} $SAINT`);

    res.json({
      success: true,
      convertedLST: usedLST,
      addedSAINT,
      LST: LST - usedLST,
      SAINT: user.SAINT + addedSAINT
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ success: false, error: "Conversion failed" });
  }
});

export default router;
