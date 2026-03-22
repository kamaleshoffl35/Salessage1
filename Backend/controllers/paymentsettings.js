const PaymentSettings = require("../models/PaymentSettings");

exports.getPaymentSettings = async (req, res) => {
  try {
    const tenant = req.user?.tenant;

    const settings = await PaymentSettings.findOne({ tenant });

    res.json(settings);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment settings" });
  }
};


exports.savePaymentSettings = async (req, res) => {
  try {
    const tenant = req.user?.tenant;

    const qrCode = req.file ? req.file.filename : null;

    const settings = await PaymentSettings.findOneAndUpdate(
      { tenant },
      {
        tenant,
        bank_name: req.body.bank_name,
        account_number: req.body.account_number,
        ifsc_code: req.body.ifsc_code,
        branch: req.body.branch,
        upi_id: req.body.upi_id,
        ...(qrCode && { qr_code: qrCode })
      },
      { new: true, upsert: true }
    );

    res.json(settings);

  } catch (err) {
    res.status(500).json({ message: "Failed to save payment settings" });
  }
};