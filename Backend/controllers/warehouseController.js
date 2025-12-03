const Warehouse = require("../models/Warehouse")

exports.getWarehouses = async (req, res) => {
  try {
    let warehouses
    if(req.user.role){
      warehouses=await Warehouse.find({created_by_role:{$in:["super_admin","admin"]}})
    }else{
        warehouses = await Warehouse.find()
    }
 res.json(warehouses)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.addWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse({...req.body,created_by_role:req.user.role})
    await warehouse.save()
    res.json(warehouse)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deleteWarehouse = async (req, res) => {
  try {
    const deleted = await Warehouse.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateWarehouse=async (req,res) => {
  try{
    const updated=await Warehouse.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.json(updated)
  }
  catch(err){
    res.status(400).json({error:err.message})
  }
}
