const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    category_id: {type: mongoose.Schema.Types.ObjectId,ref: "GoogleCategory",required: true,},
    category_name: { type: String },
    subcategory_id: {type: mongoose.Schema.Types.ObjectId,ref: "GoogleCategory",default: null,},
    subcategory_name: { type: String },
    brand_name: { type: String },
    variant: { type: String },
    unit_id: { type: String, default: "Kg" },
    warehouse:{  type: mongoose.Schema.Types.ObjectId, ref:"Warehouse",required:true},
    warehouse_name: { type: String },
    hsn_code: { type: String },
    tax_rate_id: { type: String, default: "18%" },
    mrp: { type: Number, required: true },
    purchase_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    created_by: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: false,},
    created_by_name: { type: String },
    created_by_role: { type: String, required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by_name: { type: String },
    updated_by_role: String,
    updatedAt: Date,
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
