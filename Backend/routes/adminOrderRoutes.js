const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getAllOrders, updateOrderStatus, updatePaymentStatus } = require("../controllers/adminOrderController");

router.get("/orders", getAllOrders);
router.put("/orders/:id/status", protect, updateOrderStatus);
router.put("/orders/:id/payment-status", updatePaymentStatus);

module.exports = router;