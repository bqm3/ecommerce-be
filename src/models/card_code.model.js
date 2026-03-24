const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CardCode = sequelize.define('CardCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'card_codes',
  timestamps: true,
});

module.exports = CardCode;
