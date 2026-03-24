const router = require('express').Router();
const cart = require('../controllers/cart.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.get('/', cart.getCart);
router.post('/', cart.addToCart);
router.put('/:id', cart.updateCart);
router.delete('/:id', cart.removeItem);

module.exports = router;