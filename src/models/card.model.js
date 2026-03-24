const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cvv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'cards',
  timestamps: true,
});

module.exports = Card;
