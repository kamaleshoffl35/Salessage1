const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getAllOrders, updateOrderStatus, updatePaymentStatus,editOrder,deleteOrder, } = require("../controllers/adminOrderController");

router.get("/orders", protect, getAllOrders);

router.put("/orders/:id/status", protect, updateOrderStatus);
router.put("/orders/:id/payment-status", protect, updatePaymentStatus);

router.put("/orders/:id", protect, editOrder);
router.delete("/orders/:id", protect, deleteOrder);
module.exports = router;