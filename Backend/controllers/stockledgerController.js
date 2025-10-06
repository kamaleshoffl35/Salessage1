

const Stockledger = require("../models/Stockledger");



exports.getStockledger=async (req, res) => {
  try {
    const ledgers = await Stockledger.find().populate("productId").populate("warehouseId");
    res.json(ledgers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.postStockledger= async (req, res) => {
  try {
    const ledger = new Stockledger(req.body);
    await ledger.save();
    res.status(201).json(ledger);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

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


