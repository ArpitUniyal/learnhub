module.exports = (sequelize, DataTypes) => {
  const QuizSubmission = sequelize.define(
    "QuizSubmission",
    {
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      selected_answer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: "quiz_submissions",
      timestamps: false,
      underscored: true
    }
  );

  return QuizSubmission;
};
