const mongoose = require("mongoose")
const warehouseSchema = new mongoose.Schema({
    store_name:{type:String,required:true},
    created_by_role:{type:String,required:true},
    code:{type:String, required:true},
    address:{type:String, required:true},
    state_code:{type:String},
    contact:{type:String},
    phone:{type:Number},
    email:{type:String},
    status: { type: Boolean, enum: ["active", "inactive"], default: "active" },
},
{timestamps:true})

module.exports = new mongoose.model("Warehouse",warehouseSchema)