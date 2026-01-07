const Stockledger = require("../models/Stockledger")
exports.getStockledger = async (req, res) => {
  try {
    let ledgers;
    if (req.user.role === "user") {
      ledgers = await Stockledger.find({
        created_by_role: { $in: ["super_admin", "admin", "user"] },
      })
        .limit(500)
        .populate("productId", "name")
        .populate("warehouseId", "store_name")
        .lean()
        .populate("created_by", "name email role");
    }
    ledgers = await Stockledger.find()
      .limit(500)
      .populate("productId", "name")
      .populate("warehouseId", "store_name")
      .lean()
      .populate("created_by", "name email role");
    res.json(ledgers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.postStockledger = async (req, res) => {
  try {
    const ledger = new Stockledger({
      ...req.body,
      created_by: req.user._id,
      created_by_role: req.user.role,
    });
    await ledger.save();
    res.status(201).json(ledger);
  } catch (err) {
    console.error("Error saving stocks", err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStockledger = async (req, res) => {
  try {
    const deleted = await Stockledger.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Stocks not found" });
    }
    res.json({ message: "Stocks deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStockledger = async (req, res) => {
  try {
    const oldstock = await Stockledger.findById(req.params.id);
    if (!oldstock) {
      return res.status(404).json({ error: "Stock is not found" });
    }
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldstock.name,
      newValue: req.body.name || oldstock.name,
    };
    const updated = await Stockledger.findByIdAndUpdate(
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

exports.getStockById = async (req, res) => {
  try {
    const stock = await Stockledger.findById(req.params.id)
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

// exports.getStockSummary = async (req, res) => {
//   try {
//     const summary = await StockLedger.aggregate([
//       { $sort: { createdAt: -1 } },
//       {
//         $group: {
//           _id: { productId: "$productId", warehouseId: "$warehouseId" },
//           balanceQty: { $first: "$balanceQty" },
//         },
//       },
//       {
//         $lookup: { from: "products", localField: "_id.productId", foreignField: "_id", as: "product" },
//       },
//       {
//         $lookup: { from: "warehouses", localField: "_id.warehouseId", foreignField: "_id", as: "warehouse" },
//       },
//       {
//         $project: {
//           productId: "$_id.productId",
//           productName: { $arrayElemAt: ["$product.name", 0] },
//           warehouseId: "$_id.warehouseId",
//           warehouseName: { $arrayElemAt: ["$warehouse.store_name", 0] },
//           availableQty: "$balanceQty",
//         },
//       },
//     ]);

//     res.json(summary);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };