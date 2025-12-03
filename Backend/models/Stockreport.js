const mongoose = require("mongoose")
const stockreportSchema=new mongoose.Schema({
    product_id:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
    created_by_role:{type:String,required:true},
    warehouse_id:{type:mongoose.Schema.Types.ObjectId,ref:"Warehouse",required:true},
    category_id:{type:mongoose.Schema.Types.ObjectId,ref:"Category",required:true}
})
module.exports=mongoose.model("Stockreport",stockreportSchema)