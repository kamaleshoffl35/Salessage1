const SalesReturn = require("../models/SalesReturn");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const Product= require("../models/Product")
const StockLedger = require("../models/Stockledger");

exports.addSalesReturn = async (req, res) => {
  try {
    const { invoice_no, customer_id, items, reason } = req.body;

    const sale = await Sale.findById(invoice_no);
    if (!sale) return res.status(404).json({ message: "Invoice not found." });

    const salesReturn = new SalesReturn({
      ...req.body,
      created_by: req.user._id,
      created_by_name: req.user.name,
    });

    await salesReturn.save();

    for (const item of items) {
      const lastLedger = await StockLedger.findOne({
        productId: item.product_id,
        warehouseId: sale.warehouse_id,
      }).sort({ createdAt: -1 });

      const previousBalance = lastLedger ? lastLedger.balanceQty : 0;

      await StockLedger.create({
        productId: item.product_id,
        warehouseId: sale.warehouse_id,
        txnType: "SALES_RETURN",
        txnId: salesReturn._id.toString(),
        inQty: item.quantity,
        outQty: 0,
        rate: item.return_amount,
        balanceQty: previousBalance + item.quantity,
        created_by: req.user._id,
        created_by_role: req.user.role,
      });
    }

    res.status(201).json({ message: "Sales Return Created Successfully", salesReturn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


exports.getSalesReturns = async (req, res) => {
  try {
    const salesReturns = await SalesReturn.find()
      .populate("customer_id", "name phone")
      .populate("items.product_id", "name price")
      .populate("created_by", "name email");

    res.status(200).json(salesReturns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


exports.getSalesReturnById = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id)
      .populate("customer_id", "name phone")
      .populate("items.product_id", "name price")
      .populate("created_by", "name email");

    if (!salesReturn) {
      return res.status(404).json({ message: "Sales Return not found" });
    }

    res.status(200).json(salesReturn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
