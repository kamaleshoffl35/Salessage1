const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {getPaymentSettings} = require("../controllers/paymentsettings")
router.get("/payment-settings", protect, getPaymentSettings);
module.exports=router