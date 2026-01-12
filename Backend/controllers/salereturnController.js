const SalesReturn = require("../models/SalesReturn");
const Sale = require("../models/Sale");
const Product= require("../models/Product")
const StockLedger = require("../models/Stockledger");

exports.addSalesReturn = async (req, res) => {
  try {
    const { invoice_no, items, reason } = req.body;
       const sale = await Sale.findById(invoice_no)
  .populate("customer_id")
  .populate("warehouseId"); 

    if (!sale) {
      return res.status(404).json({ message: "Invoice not found." });
    }
const updatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }
      updatedItems.push({
        product_id: item.product_id,
        product_name: product.name,   
        quantity: item.quantity,
        return_amount: item.return_amount,
      });
}
    const salesReturn = new SalesReturn({
      invoice_no: sale._id,
      invoice_number: sale.invoice_no,            
      invoice_date_time: sale.invoice_date_time,  
customer_id: sale.customer_id._id,
      customer_name: sale.customer_id.name,      
      customer_phone: sale.customer_id.phone,
items: updatedItems,
      reason,
created_by: req.user._id,
      created_by_name: req.user.name,
    });
await salesReturn.save();

  for (const item of updatedItems) {
  const lastLedger = await StockLedger.findOne({
    productId: item.product_id,
    warehouseId: sale.warehouseId._id || sale.warehouseId,

  }).sort({ createdAt: -1 });

  const previousBalance = lastLedger ? lastLedger.balanceQty : 0;

  await StockLedger.create({
    productId: item.product_id,
  warehouseId: sale.warehouseId._id || sale.warehouseId,



    txnType: "SALES_RETURN",
    txnDate: new Date(),
    txnId: `TD-${Math.floor(1000 + Math.random() * 9000)}`,


    inQty: 0,
    outQty: 0,
    quantity: item.quantity,
    balanceQty: previousBalance,
    created_by: req.user._id,
    created_by_role: req.user.role,
  });
}



    res.status(201).json({
      message: "Sales Return Created Successfully",
      salesReturn,
    });
  } catch (err) {
    console.error("Sales Return Error:", err);
    res.status(500).json({
      message: err.message || "Sales return failed",
    });
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
