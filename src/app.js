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
const userRoutes = require('./routes/user.routes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });
});

app.use(cors({
  origin: '*',
}));
app.use(express.json({limit: '100mb'}));

app.use('/api/account', authRoutes);
app.use('/api/users', userRoutes);
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
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});