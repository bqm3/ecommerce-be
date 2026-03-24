const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: DataTypes.UUID,
  productId: DataTypes.UUID,
  quantity: DataTypes.INTEGER,
  size: DataTypes.STRING,
  colors: DataTypes.JSON,
}, { tableName: 'cart_items' });

module.exports = CartItem;