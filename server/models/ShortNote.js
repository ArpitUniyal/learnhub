module.exports = (sequelize, DataTypes) => {
  const ShortNote = sequelize.define(
    "ShortNote",
    {
      pdf_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      chunk_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "short_notes",
      timestamps: false,
    }
  );

  ShortNote.associate = (models) => {
    ShortNote.belongsTo(models.Pdf, {
      foreignKey: "pdf_id",
      onDelete: "CASCADE",
    });

    ShortNote.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return ShortNote;
};
