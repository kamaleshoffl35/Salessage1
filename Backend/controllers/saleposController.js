const Sale = require("../models/Sale")

exports.getSalePOSs = async (req, res) => {
  try {
    const sales = await Sale.find().populate("customer_id", "name").populate("items.product_id", "name").populate("items.tax_rate_id", "name");

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addSalePOS = async (req, res) => {
  try {
    const sale = new Sale(req.body)
    await sale.save()
    await sale.populate("customer_id", "name");
    await sale.populate("items.product_id", "name");
    await sale.populate("items.tax_rate_id", "name")
    res.json(sale)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deleteSale = async (req, res) => {
  try {
    const deleted = await Sale.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json({ message: "Sale deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};