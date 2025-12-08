const Sale = require("../models/Sale");
exports.getSalePOSs = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer_id", "name phone")
      .populate("items.product_id", "name")
      .populate("items.tax_rate_id", "name")
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSalePOS = async (req, res) => {
  try {
    if (!req.body.items || req.body.items.length === 0) {
      return res
        .status(400)
        .json({ error: "Sale must contain at least 1 item" });
    }
    if (!req.body.customer_id) {
      return res.status(400).json({ error: "Customer is required" });
    }
    const saleData = { ...req.body, created_by: req.user._id };
    const sale = new Sale(saleData);
    const saved = await sale.save();
    const populated = await Sale.findById(saved._id)
      .populate("customer_id", "name phone")
      .populate("items.product_id", "name")
      .populate("items.tax_rate_id", "name")
      .populate("created_by", "name email role");

    res.json(populated);
  } catch (err) {
    console.error("Error saving Sale:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const deleted = await Sale.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const oldSale = await Sale.findById(req.params.id);
    if (!oldSale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldSale.name,
      newValue: req.body.name || oldSale.name,
    };
    const updated = await Sale.findByIdAndUpdate(req.params.id, allowedFields, {
      new: true,
    })
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer_id", "name phone")
      .populate("items.product_id", "name")
      .populate("items.tax_rate_id", "name")
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (err) {
    res.status(404).json({ error: "Server error" });
  }
};
