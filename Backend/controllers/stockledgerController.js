

const Stockledger = require("../models/Stockledger");



exports.getStockledger=async (req, res) => {
  try {
    let ledgers
    if(req.user.role === "user"){
        ledgers = await Stockledger.find({created_by_role:{$in:["super_admin","admin","user"]}}).limit(500).populate("productId", "name").populate("warehouseId", "store_name").lean();
    }
   ledgers = await Stockledger.find().limit(500).populate("productId", "name").populate("warehouseId", "store_name").lean();
   res.json(ledgers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.postStockledger= async (req, res) => {
  try {
    const ledger = new Stockledger({...req.body,created_by_role:req.user.role});
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


exports.updateStockledger=async (req,res) => {
    try{
        const updated=await Stockledger.findByIdAndUpdate(req.params.id,req.body,{new:true})
        res.json(updated)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
}

