const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
  createCodOrder,
  cancelOrder,
} = require("../controllers/orderController");

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/create-cod-order", protect, createCodOrder);
router.patch("/orders/:id/cancel", authMiddleware, cancelOrder);
module.exports = router;