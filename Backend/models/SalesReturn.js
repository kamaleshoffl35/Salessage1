const mongoose = require("mongoose");

const salesReturnSchema = new mongoose.Schema(
  {
    invoice_no: {type: mongoose.Schema.Types.ObjectId,ref: "Sale",required: true, },
invoice_number: {type: String, required: true,},
customer_id: {type: mongoose.Schema.Types.ObjectId,ref: "Customer",required: true,},
 customer_name: {type: String, required: true,},
 invoice_date_time:{type:Date,required:true },
customer_phone: { type: String, },
items: [
      {
        product_id: {type: mongoose.Schema.Types.ObjectId,ref: "Product",required: true,},
        product_name: {type: String,required: true,},
        quantity: {type: Number,required: true,min: 1,},
        return_amount: {type: Number,required: true,},
      },
    ],

    reason: {type: String,required: true,trim: true,},

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    created_by_name: {
      type: String, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesReturn", salesReturnSchema);
