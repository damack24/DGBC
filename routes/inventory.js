// routes/inventory.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// Fetch user's inventory
router.get("/", async (req, res) => {
  const wallet = req.query.wallet;
  if (!wallet) return res.status(400).json({ success: false, error: "Wallet required" });

  try {
    // Pull items the user has unlocked/earned
    const [rows] = await db.query(
      "SELECT item_name, item_type, rarity, obtained_at FROM inventory WHERE wallet = ? ORDER BY obtained_at DESC",
      [wallet]
    );

    res.json({ success: true, items: rows });
  } catch (err) {
    console.error("Inventory fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to load inventory" });
  }
});

// Add item (for testing or mission rewards)
router.post("/add", async (req, res) => {
  const { wallet, item_name, item_type, rarity } = req.body;
  if (!wallet || !item_name)
    return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    await db.query(
      "INSERT INTO inventory (wallet, item_name, item_type, rarity, obtained_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [wallet, item_name, item_type || "misc", rarity || "common"]
    );
    res.json({ success: true, message: "Item added to inventory." });
  } catch (err) {
    console.error("Inventory add error:", err);
    res.status(500).json({ success: false, error: "Failed to add item" });
  }
});

export default router;
