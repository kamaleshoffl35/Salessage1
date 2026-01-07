const Sale = require("../models/Sale");
const StockLedger = require("../models/Stockledger");
exports.getSalePOSs = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer_id", "name phone")
      .populate("items.product_id", "name")
      // .populate("items.stock"," inQty")
      .populate("items.tax_rate_id", "name")
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role")
      

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const mongoose = require("mongoose");




exports.addSalePOS = async (req, res) => {
  try {
   
    if (!req.body.items?.length) 
      return res.status(400).json({ error: "Sale must contain at least 1 item" });
    if (!req.body.customer_id) 
      return res.status(400).json({ error: "Customer is required" });

    const sale = new Sale({
      ...req.body,
      invoice_date_time: new Date(req.body.invoice_date_time),
      created_by: req.user._id,
    });

    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate("items.product_id", "name")

      .populate("customer_id", "name phone");

    res.json(populatedSale);
  } catch (err) {
    console.error("Error saving Sale:", err);
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
      .populate("customer_id", "name email phone")
      .populate("items.product_id", "name")
      // .populate("items.stock"," inQty")
      .populate("items.tax_rate_id", "name")
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    if (!sale.customer_name && sale.customer_id?.name) {
      sale.customer_name = sale.customer_id.name;
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


