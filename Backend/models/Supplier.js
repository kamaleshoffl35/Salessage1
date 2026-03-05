const mongoose = require("mongoose")
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String,unique:true},     
  gstin: { type: String },     
  email: { type: String },
  address: { type: String },
  state_code: { type: String },
  opening_balance: { type: Number },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_by_name:{type:String},
  created_by_role: { type: String, required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updated_by_name:{type:String},
  updated_by_role: String,
  updatedAt: Date,
  history: { oldValue: String,newValue: String,},
}, { timestamps: true });

module.exports = new mongoose.model("Supplier", supplierSchema)