const mongoose=require("mongoose")
const purchasereportSchema=new mongoose.Schema({
    from_date:{type:Date,required:true},
    to_date:{type:Date,required:true},
    supplier_id:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier"},
},
{timestamps:true})
module.exports=mongoose.model("Purchasereport",purchasereportSchema)