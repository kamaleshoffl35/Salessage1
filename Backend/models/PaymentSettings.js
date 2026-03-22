const mongoose = require("mongoose");

const paymentSettingsSchema = new mongoose.Schema({
  tenant: String,
  qr_code: String,
  bank_name: String,
  account_number: String,
  ifsc_code: String,
  branch: String,
  upi_id: String
});

module.exports = mongoose.model("PaymentSettings", paymentSettingsSchema);