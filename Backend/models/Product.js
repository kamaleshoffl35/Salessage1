const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    // Category (No Google Reference)
    category_name: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory_name: {
      type: String,
      default: null,
      trim: true,
    },

    brand_name: {
      type: String,
      trim: true,
    },

    // Variant / Dimension Logic
    variant: {
      type: String,
      default: null,
      trim: true,
    },

    dimension: {
      type: String,
      default: null,
      trim: true,
    },

    // Inventory
    unit_id: {
      type: String,
      default: "Kg",
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    warehouse_name: {
      type: String,
    },

    // Tax & Pricing
    hsn_code: {
      type: String,
      trim: true,
    },

    tax_rate_id: {
      type: String,
      default: "18%",
    },

    mrp: {
      type: Number,
      required: true,
    },

    purchase_price: {
      type: Number,
      required: true,
    },

    sale_price: {
      type: Number,
      required: true,
    },

    // Status
    status: {
      type: Boolean,
      default: true,
    },

    // Created Info
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    created_by_name: {
      type: String,
    },

    created_by_role: {
      type: String,
      required: true,
    },

    // Updated Info
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updated_by_name: {
      type: String,
    },

    updated_by_role: {
      type: String,
    },

    updatedAt: {
      type: Date,
    },
    website: {
  type: String,
  enum: ["vyoobam", "chakrapani"],
  default: "vyoobam",
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);