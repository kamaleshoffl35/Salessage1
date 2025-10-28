const Expense=require("../models/Expense")

exports.getexpenses=async (req,res) => {
    try{
        let expenses
        if(req.user.role === "user"){
            expenses=await Expense.find({created_by_role:{$in:["super_admin","admin","user"]}}).populate("warehouseId")
        }
        else{
           expenses= await Expense.find().populate("warehouseId")
        }
          
        res.json(expenses)
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
}

exports.addexpense=async (req,res) => {
    try{
        const expense=new Expense({...req.body,created_by_role:req.user.role})
        await expense.save()
        res.json(expense)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
}

exports.deleteexpense=async (req,res) => {
    try{
        await Expense.findByIdAndDelete(req.params.id)
        res.json({message:"Expense Deleted"})
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
}


exports.updateexpense=async (req,res) => {
    try{
        const updated=await Expense.findByIdAndUpdate(req.params.id,req.body,{new:true})
        res.json(updated)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
}