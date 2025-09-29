const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    from_date: { type: Date, required: true },
    to_date: { type: Date, required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    invoice_type: { type: String, enum: ["All", "Cash", "Credit"], default: "All" },
    invoice_no: { type: String },
    payment_mode: { type: String, enum: ["Cash", "Card", "UPI", "Credit"], default: "Cash" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salereport", SaleSchema);
