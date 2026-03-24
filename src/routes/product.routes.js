const router = require('express').Router();
const product = require('../controllers/product.controller');

router.get('/', product.getProducts);
router.get('/:id', product.getProduct);
router.post('/', product.createProduct);

module.exports = router;