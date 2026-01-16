module.exports = (sequelize, DataTypes) => {
  const QuizSession = sequelize.define(
    "QuizSession",
    {
      pdf_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      used_chunk_ids: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: "quiz_sessions",
      timestamps: true,   // ✅ MUST be true
      underscored: true,  // ✅ MUST be true (created_at / updated_at)
    }
  );

  return QuizSession;
};
