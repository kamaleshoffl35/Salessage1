const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  createCodOrder,
} = require("../controllers/orderController");

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/create-cod-order", createCodOrder);

module.exports = router;