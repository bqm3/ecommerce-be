const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  code: DataTypes.STRING,
  sku: DataTypes.STRING,
  price: DataTypes.FLOAT,
  priceSale: DataTypes.FLOAT,
  cover: DataTypes.STRING,
  images: DataTypes.JSON,
  tags: DataTypes.JSON,
  colors: DataTypes.JSON,
  sizes: DataTypes.JSON,
  category: DataTypes.STRING,
  gender: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: DataTypes.STRING,
  inventoryType: DataTypes.STRING,
  available: DataTypes.INTEGER,
  sold: DataTypes.INTEGER,
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;