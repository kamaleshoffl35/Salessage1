const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");

const {
  getPaymentSettings,
  savePaymentSettings
} = require("../controllers/paymentsettings");

const { uploadQR } = require("../middleware/upload");

/* ================================
   Get Payment Settings
================================ */

router.get("/", protect, getPaymentSettings);

/* ================================
   Save / Update Payment Settings
================================ */

router.post(
  "/",
  protect,
  uploadQR.single("qr_code"),
  savePaymentSettings
);

module.exports = router;