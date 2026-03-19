const Review = require("../models/Review");
const Product = require("../models/Product");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, name, email, rating, comment, userId } = req.body;

    if (!productId || !name || !email || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = new Review({
      product: productId,
      user: userId || null,
      name,
      email,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews for a product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};