const Expense=require("../models/Expense")

exports.getexpenses=async (req,res) => {
    try{
        let expenses
        if(req.user.role === "user"){
            expenses=await Expense.find({created_by_role:{$in:["super_admin","admin","user"]}}).populate("warehouseId")
            .populate("created_by","name email role")
        }
        else{
           expenses= await Expense.find().populate("warehouseId").populate("created_by","name email role")
        }
          
        res.json(expenses)
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
}

exports.addexpense=async (req,res) => {
    try{
        const expense=new Expense({...req.body,created_by:req.user._id,created_by_role:req.user.role})
        await expense.save()
        res.json(expense)
    }
    catch(err){
        console.error("Error saving expense ",err)
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
        const oldexpense=await Expense.findById(req.params.id)
        if(!oldexpense){
            return res.status(404).json({error:"Expense is not found"})
        }
        const allowedFields={...req.body}
        delete allowedFields.id
        delete allowedFields._id
        allowedFields.updated_by=req.user._id
        allowedFields.updated_by_role=req.user.role
        allowedFields.updatedAt=new Date()
        allowedFields.history={
            oldValue:oldexpense.name,
            newValue:req.body.name || oldexpense.name
        }
        const updated=await Expense.findByIdAndUpdate(req.params.id,allowedFields,{new:true})
        .populate("created_by","name email role").populate("updated_by","name email role")
        res.json(updated)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
}

exports.getExpenseById=async (req,res) => {
    try{
        const expense=await Expense.findById(req.params.id)
        .populate("created_by","name email role").populate("updated_by","name email role")
        if(!expense){
            return res.status(404).json({error:"Expense not found"})
        }
        res.json(expense)
    }
    catch(err){
        res.status(404).json({error:"server error"})
    }
}