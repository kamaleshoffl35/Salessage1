const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unit_name: { type: String, required: true },
    unit_symbol: { type: String, required: true },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    created_by_name: String,

    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by_name: String,

    history: {
      oldValue: String,
      newValue: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Unit", unitSchema);