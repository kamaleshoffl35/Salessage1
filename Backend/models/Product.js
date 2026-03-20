const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  sku: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },

  description: { type: String, trim: true, default: "" },

  short_description: { type: String, trim: true, default: "" },
  features: { type: String, trim: true, default: "" },
  spiritual_significance: { type: String, trim: true, default: "" },
  ideal_placement: { type: String, trim: true, default: "" },
  care_instructions: { type: String, trim: true, default: "" },
  tags: { type: String, trim: true, default: "" },

  image: { type: String, default: null },

  category_name: { type: String, required: true, trim: true },
  subcategory: { type: String, trim: true },   // 1,2,3
// subcategory_name: { type: String, trim: true },
subcategory_name: [{ type: String }],
  brand_name: { type: String, trim: true },

  // keep existing
  variant: { type: String, default: null, trim: true },
  dimension: { type: String, default: null, trim: true },

  // ✅ NEW ARRAY FOR MULTIPLE SIZES
  dimensions: {
  type: [
    {
      size: { type: String, trim: true },
      mrp: Number,
      purchase_price: Number,
      sale_price: Number
    }
  ],
  default: []
},
unit_id: { type: String, default: null },

// ✅ BASE UNIT (kg, L, pc etc)
base_unit: {
  type: String,
  default: null,
  trim: true
},

// ✅ UNIT VARIANTS (250 g, 500 g, 1 kg etc)
unit_variants: {
  type: [
    {
      value: Number,
      unit: String
    }
  ],
  default: []
},

  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    
  },

  warehouse_name: { type: String },

  hsn_code: { type: String, trim: true },
  tax_rate_id: { type: String, default: "18%" },

  // keep existing price fields
  mrp: { type: Number, },
  purchase_price: { type: Number, },
  sale_price: { type: Number, },

  status: { type: Boolean, default: true },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_by_name: { type: String },
  created_by_role: { type: String, required: true },

  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updated_by_name: { type: String },
  updated_by_role: { type: String },

  updatedAt: { type: Date },

  website: {
    type: String,
    enum: ["vyoobam", "chakrapani"],
    default: "vyoobam",
  },
},
{ timestamps: true }
);
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category_name: 1 });
productSchema.index({ subcategory_name: 1 });

module.exports = mongoose.model("Product", productSchema);