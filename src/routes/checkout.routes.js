const router = require('express').Router();
const checkout = require('../controllers/checkout.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.get('/', checkout.getCheckout);
router.post('/', checkout.checkout);

module.exports = router;