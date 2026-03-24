const Review = require('../models/review.model');

// ADD REVIEW
exports.addReview = async (req, res) => {
  try {
    const review = await Review.create({
      productId: req.params.id,
      userId: req.user.id,
      name: req.user.firstName,
      avatarUrl: '',
      comment: req.body.comment,
      rating: req.body.rating,
      isPurchased: true,
      helpful: 0,
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET REVIEWS (with pagination)
exports.getReviews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 5);
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { productId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      reviews: rows,
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