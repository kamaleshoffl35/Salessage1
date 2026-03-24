const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    phone: String,
    email: String,
    address: String,
    extraFields: [
      {
        label: String,
        value: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setup", setupSchema);