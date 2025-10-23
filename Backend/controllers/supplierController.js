const Supplier = require("../models/Supplier")

exports.getSuppliers = async (req, res) => {
  try {
    let suppliers
    if(req.user.role === "user"){
            suppliers=await Supplier.find({created_by_role:{$in:["super_admin","admin"]}})
    }else{
         suppliers = await Supplier.find()
    }
    res.json(suppliers)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.addSupplier = async (req, res) => {
  try {
  
    const supplier = new Supplier({...req.body,created_by_role:req.user.role})
    await supplier.save()
    res.json(supplier)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSupplier=async(req,res)=>{
  try{
    const updated=await Supplier.findByIdAndUpdate(req.params.id,req.body,{new : true})
    res.json(updated)

  }
  catch(err){
    res.status(400).json({error:err.message})
  }
}