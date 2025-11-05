// const SupplierPayment = require("../models/SupplierPayment")
// const Supplier = require("../models/Supplier");

exports.getSupplierPayments = async (req, res) => {

    try {
      let receipts
      if(req.user.role === "user"){
         receipts=await SupplierPayment.find({created_by_role:{$in :["super_admin","admin","user"]}}).populate('supplier_id','name')
      }
      else{
         receipts = await SupplierPayment.find().populate('supplier_id', 'name')
      }
      
      res.json(receipts)
    }
    catch (err) {
      res.status(500).json({ error: err.message })
    }

  
}


