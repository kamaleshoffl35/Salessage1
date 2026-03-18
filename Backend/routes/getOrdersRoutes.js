const express = require("express");
const router = express.Router();
const orderController = require("../controllers/getOrdersController");
const { protect } = require("../middleware/auth");

// ✅ My Orders Route
router.get(
  "/my-orders",
  protect,
  orderController.getMyOrders
);

module.exports = router;