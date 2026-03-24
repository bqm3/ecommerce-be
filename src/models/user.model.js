const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  avatarUrl: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  phoneNumber: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'banned', 'pending'),
    defaultValue: 'active',
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;