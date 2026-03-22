const PaymentSettings = require("../models/PaymentSettings");

exports.getPaymentSettings = async (req, res) => {
  try {
    const tenant = req.user?.tenant;

    const settings = await PaymentSettings.findOne({ tenant });

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment details" });
  }
};