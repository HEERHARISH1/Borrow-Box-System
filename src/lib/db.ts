import mysql from "mysql2/promise"

// Create a connection pool
export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "sdaproject",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test the connection
db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully")
    connection.release()
  })
  .catch((err) => {
    console.error("Database connection failed:", err)
  })
