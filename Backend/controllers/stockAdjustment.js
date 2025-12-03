const StockAdj = require("../models/StockAdj")

exports.getStockAdjustment = async (req, res) => {
  try {
    let stocks
    if(req.user.role === "user"){
      stocks=(await StockAdj.find({created_by_role:{$in:["super_admin","admin","user"]}})).populate('items.product_id')
    }
    else{
      stocks = await StockAdj.find().populate('warehouse_id').populate('items.product_id')
    }
    
    res.json(stocks)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.addStockAdjustment = async (req, res) => {
  try {
    const stock = new StockAdj({...req.body,created_by_role:req.user.role})
    await stock.save()
    res.json(stock)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
}

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


exports.updateStockAdjustment=async (req,res) => {
  try{
    const updated=await StockAdj.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.json(updated)
  }
  catch(err){
    res.status(400).json({error:err.message})
  }
}