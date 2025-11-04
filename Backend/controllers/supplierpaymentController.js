const SupplierPayment = require("../models/SupplierPayment")
const Supplier = require("../models/Supplier");

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

// exports.addSupplierPayment = async (req, res) => {
//   try {
//     const supplier = await Supplier.findById(req.body.supplier_id);
//     const receipt = new SupplierPayment({ ...req.body, supplier_name: supplier.name ,created_by_role:req.user.role});
//     await receipt.save();
//     await receipt.populate("supplier_id", "name");

//     res.json(receipt);
//   }
//   catch (err) {
//     res.status(400).json({ error: err.message })
//   }
// }

// exports.deletePayment = async (req, res) => {
//   try {
//     const deleted = await SupplierPayment.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Supplier not found" });
//     }
//     res.json({ message: "Supplier deleted" });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.updatePayment=async (req,res) => {
//   try{
//     const updated=await SupplierPayment.findByIdAndUpdate(req.params.id,req.body,{new:true})
//     res.json(updated)
//   }
//   catch(err){
//     res.status(400).json({error:err.message})
//   }
// }

