const CustomerPayment = require("../models/CustomerPayment")

exports.getCustomerPayments = async (req, res) => {
  try {
    let receipts
    if(req.user.role === "user"){
       receipts=await CustomerPayment.find({created_by_role:{$in:["super_admin","admin","user"]}}).populate('customer_id', 'name')
    }else{
       receipts = await CustomerPayment.find().populate('customer_id', 'name')
    }
    
    res.json(receipts)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// exports.addCustomerPayment = async (req, res) => {
//   try {
//     const receipt = new CustomerPayment({...req.body,created_by_role:req.user.role})
//     await receipt.save()
//     await receipt.populate('customer_id', 'name')
//     res.json(receipt)
//   }
//   catch (err) {
//     res.status(400).json({ error: err.message })
//   }
// }

// exports.deletePayment = async (req, res) => {
//   try {
//     const deleted = await CustomerPayment.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Payment not found" });
//     }
//     res.json({ message: "Payment deleted" });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.updatePayment=async (req,res) => {
//   try{
//         const updated=await CustomerPayment.findByIdAndUpdate(req.params.id,req.body,{new:true})
//   res.json(updated)
//   }
//   catch(err){
//     res.status(400).json({error:err.message})
//   }
// }