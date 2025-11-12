import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Load variables from .env

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "goodfellas_user",
  password: process.env.DB_PASSWORD || "StrongPass123!",
  database: process.env.DB_NAME || "goodfellas",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
