const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: DataTypes.UUID,
  userId: DataTypes.UUID,
  name: DataTypes.STRING,
  avatarUrl: DataTypes.STRING,
  comment: DataTypes.TEXT,
  rating: DataTypes.INTEGER,
  isPurchased: DataTypes.BOOLEAN,
  helpful: DataTypes.INTEGER,
}, { tableName: 'reviews' });

module.exports = Review;