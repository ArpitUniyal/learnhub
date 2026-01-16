module.exports = (sequelize, DataTypes) => {
  const Pdf = sequelize.define(
    'Pdf',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      original_name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      file_name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      file_path: {
        type: DataTypes.STRING,
        allowNull: false
      },

      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'uploaded'
      },

      extracted_text: {
        type: DataTypes.TEXT('long'),
        allowNull: true
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'pdfs',
      timestamps: false,
      underscored: true
    }
  );

  return Pdf;
};
