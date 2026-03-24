require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reviewRoutes = require('./routes/review.routes');
const cartRoutes = require('./routes/cart.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const uploadRoutes = require('./routes/upload.routes');
const cardRoutes = require('./routes/card.routes');

const app = express();

app.use(cors({
  origin: '*',
}));
app.use(express.json({limit: '100mb'}));

app.use('/api/account', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cards', cardRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true });
}

sequelize.sync().then(() => {
  console.log('DB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});