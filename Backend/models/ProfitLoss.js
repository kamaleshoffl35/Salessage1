const mongoose = require("mongoose");
const profitLossSchema = new mongoose.Schema({
    from_date:{type:Date,required:true},
    to_date:{type:Date,required:true},
    warehouse_id:{type:mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    product_category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    customer_type: { type: String, enum: ["retail", "wholesale", "other"] },
   sales: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    cogs: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    gross_profit: { type: Number, default: 0 },
    net_profit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("ProfitLoss", profitLossSchema);
