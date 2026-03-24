const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');

router.post('/', cardController.createCard);
router.get('/', cardController.getCards);
router.post('/code', cardController.createCardCode);

module.exports = router;
