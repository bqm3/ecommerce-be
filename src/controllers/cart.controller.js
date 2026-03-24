const CartItem = require('../models/cart_item.model');
const Product = require('../models/product.model');

// ADD
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, colors } = req.body;

    const item = await CartItem.create({
      userId: req.user.id,
      productId,
      quantity,
      size,
      colors,
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    include: Product,
  });

  const result = items.map(item => ({
    id: item.id,
    name: item.Product.name,
    cover: item.Product.cover,
    price: item.Product.price,
    quantity: item.quantity,
    subtotal: item.Product.price * item.quantity,
    colors: item.colors,
    size: item.size,
    available: item.Product.available,
  }));

  res.json(result);
};

// UPDATE
exports.updateCart = async (req, res) => {
  const item = await CartItem.findByPk(req.params.id);

  item.quantity = req.body.quantity;
  await item.save();

  res.json(item);
};

// DELETE
exports.removeItem = async (req, res) => {
  await CartItem.destroy({
    where: { id: req.params.id },
  });

  res.json({ message: 'Deleted' });
};