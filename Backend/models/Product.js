const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    created_by_role: { type: String, required: true },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    brand_name: { type: String },
    variant: { type: String },
    unit_id: { type: String, default: "Kg" },
    hsn_code: { type: String },
    tax_rate_id: { type: String, default: "18%" },
    mrp: { type: Number, required: true },
    purchase_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    min_stock: { type: Number, default: 0 },
    barcode: { type: String },
    is_batch_tracked: { type: Boolean, default: false },
    is_serial_tracked: { type: Boolean, default: false },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by_role: String,
    updatedAt: Date,
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
