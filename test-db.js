// test-db.js
import pool from "./db.js";

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("DB works:", rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error("DB ERROR:", err);
  }
})();
