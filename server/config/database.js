const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,        // MYSQLDATABASE
  process.env.DB_USER,        // MYSQLUSER
  process.env.DB_PASSWORD,    // MYSQLPASSWORD
  {
    host: process.env.DB_HOST, // MYSQLHOST
    port: process.env.DB_PORT, // MYSQLPORT
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection (VERY IMPORTANT for Railway logs)
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

module.exports = sequelize;
