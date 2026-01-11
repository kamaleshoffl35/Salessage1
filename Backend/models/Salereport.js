const mongoose = require("mongoose");
const SaleSchema = new mongoose.Schema(
  {
    from_date: { type: Date, required: true },
    to_date: { type: Date, required: true },
    created_by_role:{type:String,required:true},
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salereport", SaleSchema);
