


const Customer = require('../models/Customer')

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
    res.json(customers)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.addCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body)
    await customer.save()
    res.json(customer)
  }
  catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCustomer=async(req,res)=>{
    try{
      const updated=await Customer.findByIdAndUpdate(req.params.id,req.body,{new:true})
      res.json(updated)
    }catch(err){
      res.status(400).json({error:err.message})
    }
}

