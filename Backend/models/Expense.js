const mongoose=require("mongoose")

const ExpenseSchema = new mongoose.Schema({
    expenseDate:{type:Date, required:true},
    created_by_role:{type:String,required:true},
    warehouseId:{type:mongoose.Schema.Types.ObjectId,ref:"Warehouse",required:true},
    expenseHead:{type:String,enum:["RENT","EB BILL", "SALARY"],required:true},
    amount:{type:Number, required:true},
    notes:{type:String},
    created_by:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:false},
    updated_by:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    updated_by_role:String,
    updated_At:Date,
    history:{
        oldValue:String,
        newValue:String,
    }
},
{timestamps:true})

module.exports = mongoose.model("Expense",ExpenseSchema)