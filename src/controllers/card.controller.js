const Card = require('../models/card.model');
const CardCode = require('../models/card_code.model');

// CREATE CARD
exports.createCard = async (req, res) => {
  try {
    const { name, cardNumber, cvv, expiry } = req.body;
    const card = await Card.create({ name, cardNumber, cvv, expiry });
    
    // EMIT SOCKET EVENT
    const io = req.app.get('socketio');
    io.emit('card-added', card);

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CARDS WITH PAGINATION
exports.getCards = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { count, rows } = await Card.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      cards: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE CARD CODE
exports.createCardCode = async (req, res) => {
  try {
    const { cardNumber, code } = req.body;
    const cardCode = await CardCode.create({ cardNumber, code });
    res.status(201).json(cardCode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
