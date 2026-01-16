const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "ai_learning",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    pool: {
      max: process.env.DB_POOL_MAX || 5,
      min: process.env.DB_POOL_MIN || 0,
      acquire: process.env.DB_POOL_ACQUIRE || 30000,
      idle: process.env.DB_POOL_IDLE || 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
