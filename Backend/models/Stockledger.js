const mongoose = require("mongoose");
const StockLedgerSchema = new mongoose.Schema(
  {
    productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required: true,},
    created_by_role:{type:String,required:true},
    warehouseId: {type: mongoose.Schema.Types.ObjectId,ref: "Warehouse",required: true,},
    txnType: {type: String,enum: ["SALE", "PURCHASE", "ADJUSTMENT"],required: true,},
    txnId: {type: String,required: true,},
    txnDate: {type: Date,required: true,},
    inQty: {type: Number,default: 0, },
    outQty: {type: Number,default: 0,},

    balanceQty: {type: Number,default: 0,},
    created_by:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:false},
    updated_by:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    updated_by_role:String,
    updatedAt:Date,
    history:{
      oldValue:Number,
      newValue:Number,
    }
  },
  { timestamps: true }
);

module.exports =
 
  mongoose.model("StockLedger", StockLedgerSchema);

