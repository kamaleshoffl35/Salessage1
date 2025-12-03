const mongoose = require("mongoose")
const supplierSchema = new mongoose.Schema({
    name:{type:String, required:true},
    created_by_role:{type:String,required:true},
    phone:{type:Number},
    gstin:{type:Number},
    email:{type:String},
    address:{type:String},
    state_code:{type:String},
    opening_balance:{type:Number},
},
{timestamps:true}
)
module.exports = new mongoose.model("Supplier", supplierSchema)