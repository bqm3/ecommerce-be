const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: DataTypes.UUID,
  total: DataTypes.FLOAT,
  subtotal: DataTypes.FLOAT,
  shipping: DataTypes.FLOAT,
  discount: DataTypes.FLOAT,
  status: DataTypes.STRING,
  paymentMethod: DataTypes.STRING,
  billing: DataTypes.JSON,
}, { tableName: 'orders' });

module.exports = Order;