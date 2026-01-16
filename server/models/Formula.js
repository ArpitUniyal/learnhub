module.exports = (sequelize, DataTypes) => {
  const Formula = sequelize.define(
    "Formula",
    {
      formula: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      formula_usage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      chunk_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "formulas",
      timestamps: false, // because created_at is handled by DB
    }
  );

  Formula.associate = (models) => {
    Formula.belongsTo(models.Pdf, { foreignKey: "pdf_id" });
    Formula.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Formula;
};
