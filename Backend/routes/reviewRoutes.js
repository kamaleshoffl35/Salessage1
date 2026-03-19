const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Route to create a new review
router.post("/", reviewController.createReview);

// Route to get reviews for a product
router.get("/:productId", reviewController.getReviewsByProduct);

module.exports = router;