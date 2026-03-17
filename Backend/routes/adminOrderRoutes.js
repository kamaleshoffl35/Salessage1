const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getAllOrders, updateOrderStatus } = require("../controllers/adminOrderController");

router.get("/orders", getAllOrders);
router.put("/orders/:id/status", protect, updateOrderStatus);

module.exports = router;