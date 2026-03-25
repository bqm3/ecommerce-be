const CartItem = require('../models/cart_item.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const OrderDetail = require('../models/order_detail.model');

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
  try {
    const cartItems = req.body.cart || [];

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;

    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const userId = req.user ? req.user.id : null;

    const order = await Order.create({
      userId: userId,
      subtotal,
      shipping: req.body.shipping || 0,
      discount: req.body.discount || 0,
      total: subtotal + (req.body.shipping || 0) - (req.body.discount || 0),
      billing: req.body.billing,
      paymentMethod: req.body.payment,
      status: 'PAID', // mark as successful/paid invoice
    });

    // Create order details (invoice details)
    const orderDetailsPromises = cartItems.map(item => {
      return OrderDetail.create({
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      });
    });

    await Promise.all(orderDetailsPromises);

    // clear cart if user is logged in
    if (userId) {
      await CartItem.destroy({ where: { userId } });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ORDERS (INVOICES)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
    });
    
    // We also want to include the OrderDetail data if it existed.
    // But since Order.hasMany(OrderDetail) might be strictly defined in order_detail.model,
    // we'll load them explicitly using OrderDetail to ensure it doesn't crash on bad association scope.
    
    const ordersWithDetails = await Promise.all(
      orders.map(async (o) => {
        const details = await OrderDetail.findAll({ 
          where: { orderId: o.id },
          include: [Product]
        });
        
        const mappedItems = details.map(d => ({
          ...d.toJSON(),
          name: d.Product ? d.Product.name : 'Unknown Product',
          description: d.Product ? d.Product.description : '',
        }));

        return {
          ...o.toJSON(),
          items: mappedItems,
        };
      })
    );

    res.json(ordersWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDER BY ID (INVOICE DETAILS)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const details = await OrderDetail.findAll({ 
      where: { orderId: order.id },
      include: [Product]
    });
    
    const mappedItems = details.map(d => ({
      ...d.toJSON(),
      name: d.Product ? d.Product.name : 'Unknown Product',
      description: d.Product ? d.Product.description : '',
    }));
    
    res.json({
      ...order.toJSON(),
      items: mappedItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};