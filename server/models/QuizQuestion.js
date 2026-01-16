module.exports = (sequelize, DataTypes) => {
  const QuizQuestion = sequelize.define(
    "QuizQuestion",
    {
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question: DataTypes.TEXT,
      options: DataTypes.JSON,
      correct_answer: DataTypes.STRING,
      chunk_id: DataTypes.INTEGER,
    },
    {
      tableName: "quiz_questions",
      timestamps: true,
      underscored: true,
    }
  );

  return QuizQuestion;
};
