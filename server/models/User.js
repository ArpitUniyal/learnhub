const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reset_password_token: {
  type: DataTypes.STRING(255),
  allowNull: true
},

reset_password_expires: {
  type: DataTypes.DATE,
  allowNull: true
},
    role: {
      type: DataTypes.ENUM('student', 'instructor', 'admin'),
      defaultValue: 'student'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,

    // 👇 THIS IS FINE – DO NOT REMOVE
    defaultScope: {
      attributes: { exclude: ['password'] }
    }
  });

  // Hash password ONLY on create
  User.beforeSave(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

  return User;
};
