// const CustomerPayment = require("../models/CustomerPayment")

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
