const Purchase = require("../models/Purchase");
const StockLedger = require("../models/Stockledger")

exports.getPurchases = async (req, res) => {
  try {
    let purchases;
    if (req.user.role) {
      purchases = await Purchase.find({
        created_by_role: { $in: ["super_admin", "admin"] },
      })
        .populate("supplier_id warehouse_id items.product_id")
        .populate("created_by", "name email role");
    } else {
      purchases = await Purchase.find()
        .populate("items.product_id")
        .populate("supplier_id")
        .populate("warehouse_id")
        .populate("created_by", "name email role");
    }

    res.json(purchases);
  } catch {
    res.status(500).json({ error: err.message });
  }
};

exports.addPurchase = async (req, res) => {
  try {
    const purchase = new Purchase({
      ...req.body,
      created_by: req.user._id,
      created_by_role: req.user.role,
    });

    await purchase.save();

for (const item of purchase.items) {
  const lastLedger = await StockLedger.findOne({
    productId: item.product_id,
    warehouseId: purchase.warehouse_id,
  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger ? lastLedger.balanceQty : 0;

  await StockLedger.create({
    productId: item.product_id,
    warehouseId: purchase.warehouse_id,

    txnType: "PURCHASE",
    txnId: purchase.invoice_no,
    txnDate: purchase.invoice_date, 

    inQty: Number(item.qty),
    outQty: 0,

    rate: Number(item.unit_price), 
    balanceQty: previousBalance + Number(item.qty),

    created_by: req.user._id,
    created_by_role: req.user.role,
  });
}


    res.json(purchase);
  } catch (err) {
    console.error("Error saving purchase", err);
    res.status(400).json({ error: err.message });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json({ message: "Purchase deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const oldPurchase = await Purchase.findById(req.params.id);
    if (!oldPurchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldPurchase.name,
      newValue: req.body.name || oldPurchase.name,
    };
    const updated = await Purchase.findByIdAndUpdate(
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

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    return res.json(purchase);
  } catch (err) {
    res.status(404).json({ error: "Server Error" });
  }
};
