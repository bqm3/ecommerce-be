const Product = require("../models/product.model");
const Review = require("../models/review.model");
const { Op } = require("sequelize");

// GET LIST (with pagination)
exports.getProducts = async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, sort } = req.query;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const where = {};

    if (category) where.category = category;
    if (gender) where.gender = gender;

    if (minPrice && maxPrice) {
      where.price = {
        [Op.between]: [minPrice, maxPrice],
      };
    }

    // Sort: e.g. sort=price_asc | price_desc | newest
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'newest') order = [['createdAt', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    res.json({
      products: rows,
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

// GET DETAIL
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    const reviews = await Review.findAll({
      where: { productId: product.id },
    });

    const totalReview = reviews.length;
    const totalRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / (totalReview || 1);

    res.json({
      ...product.toJSON(),
      reviews,
      totalReview,
      totalRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      images: req.body.images, // array URL
      cover: req.body.images?.[0],
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update({
      ...req.body,
      images: req.body.images,
      cover: req.body.images?.[0] || product.cover,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
