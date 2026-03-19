const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
{
  category_name: {
    type: String,
    required: true,
    trim: true,
  },

  subcategory: {
    type: String,
    required: true,
    trim: true,
  },

  subcategory1: [
    {
      type: String,
      trim: true,
    },
  ],

  status: {
    type: Boolean,
    default: true,
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  created_by_name: String,
  created_by_role: String,

  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updated_by_name: String,
  updated_by_role: String,
},
{ timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);