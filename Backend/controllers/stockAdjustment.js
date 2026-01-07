const StockAdj = require("../models/StockAdj");
const StockLedger = require("../models/Stockledger");

exports.getStockAdjustment = async (req, res) => {
  try {
    let stocks;
    if (req.user.role === "user") {
      stocks = (
        await StockAdj.find({
          created_by_role: { $in: ["super_admin", "admin", "user"] },
        })
      )
        .populate("items.product_id")
        .populate("created_by", "name email role");
    } else {
      stocks = await StockAdj.find()
        .populate("warehouse_id")
        .populate("items.product_id")
        .populate("created_by", "name email role");
    }

    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStockAdjustment = async (req, res) => {
  try {
    const stock = new StockAdj({
      ...req.body,
      created_by: req.user._id,
      created_by_role: req.user.role,
    });

    await stock.save();

    for (const item of stock.items) {
      const lastLedger = await StockLedger.findOne({
        productId: item.product_id,
        warehouseId: stock.warehouse_id,
      }).sort({ createdAt: -1 });

      const previousBalance = lastLedger ? lastLedger.balanceQty : 0;

      await StockLedger.create({
        productId: item.product_id,
        warehouseId: stock.warehouse_id,
        txnType: "ADJUSTMENT",
        txnId: stock._id.toString(),
        inQty: item.inQty || 0,
        outQty: item.outQty || 0,
        rate: item.rate || 0,
        balanceQty: previousBalance + (item.inQty || 0) - (item.outQty || 0),
        created_by: req.user._id,
        created_by_role: req.user.role,
      });
    }

    res.json(stock);
  } catch (err) {
    console.error("Error saving StockAdjustment", err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStockAdjustment = async (req, res) => {
  try {
    const deleted = await StockAdj.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Stocks not found" });
    }
    res.json({ message: "Stocks deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStockAdjustment = async (req, res) => {
  try {
    const oldStockAdjustment = await StockAdj.findById(req.params.id);
    if (!oldStockAdjustment) {
      return res.status(404).json({ error: "StockAdjustment not found" });
    }
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldStockAdjustment.name,
      newValue: req.body.name || oldStockAdjustment.name,
    };
    const updated = await StockAdj.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true }
    )
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getStockByID = async (req, res) => {
  try {
    const stock = await StockAdj.findById(req.params.id)
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }
    return res.json(stock);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
