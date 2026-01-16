module.exports = (sequelize, DataTypes) => {
  const Flashcard = sequelize.define(
    "Flashcard",
    {
      front: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      back: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      chunk_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "flashcards",
      timestamps: false, // IMPORTANT (you already manage created_at)
    }
  );

  Flashcard.associate = (models) => {
    Flashcard.belongsTo(models.Pdf, { foreignKey: "pdf_id" });
    Flashcard.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Flashcard;
};
