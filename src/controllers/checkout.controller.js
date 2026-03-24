const CartItem = require('../models/cart_item.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// GET CHECKOUT STATE
exports.getCheckout = async (req, res) => {
  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    include: Product,
  });

  let subtotal = 0;
  let totalItems = 0;

  const cart = items.map(item => {
    const sub = item.Product.price * item.quantity;
    subtotal += sub;
    totalItems += item.quantity;

    return {
      id: item.id,
      name: item.Product.name,
      cover: item.Product.cover,
      price: item.Product.price,
      quantity: item.quantity,
      subtotal: sub,
    };
  });

  const shipping = 20;
  const discount = 0;
  const total = subtotal + shipping - discount;

  res.json({
    cart,
    subtotal,
    total,
    discount,
    shipping,
    billing: null,
    totalItems,
  });
};

// CHECKOUT
exports.checkout = async (req, res) => {
  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    include: Product,
  });

  let subtotal = 0;

  items.forEach(i => {
    subtotal += i.Product.price * i.quantity;
  });

  const order = await Order.create({
  userId: req.user.id,
  subtotal,
  shipping: req.body.shipping || 0,
  discount: req.body.discount || 0,
  total: subtotal + (req.body.shipping || 0) - (req.body.discount || 0),
  billing: req.body.billing,
  paymentMethod: req.body.payment,
  status: 'PENDING',
});

  // clear cart
  await CartItem.destroy({ where: { userId: req.user.id } });

  res.json(order);
};