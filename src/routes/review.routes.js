const router = require('express').Router();
const review = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');

router.get('/:id', review.getReviews);
router.post('/:id', auth, review.addReview);

module.exports = router;