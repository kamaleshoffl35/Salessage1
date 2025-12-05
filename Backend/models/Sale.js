const mongoose = require('mongoose');
const SaleItemSchema = new mongoose.Schema({
  product_id:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true },
  batch_no:{type:String},
  qty:{type:Number,required:true},
  unit_price:{type:Number,required:true},
  discount_percent:{type:Number,default:0},
  tax_rate_id:{type:mongoose.Schema.Types.ObjectId,ref:'Tax'},
  cgst_amount:{type:Number,default:0},
  sgst_amount:{type:Number,default:0},
  igst_amount:{type:Number,default:0},
  line_total: { type: Number, required: true }
}, { timestamps: true });


const SaleSchema = new mongoose.Schema({
  invoice_no:{type:String,required:true},
  invoice_date_time:{type:Date,required:true },
  customer_id:{type:mongoose.Schema.Types.ObjectId,ref:'Customer'},
  counter_id:{type:String,required:true},
  payment_mode:{type:String,required:true},
  subtotal:{type:Number,default:0},
  discount_amount:{type:Number,default:0},
  tax_amount:{type:Number,default:0},
  grand_total:{type:Number,default:0},
  paid_amount:{type:Number,default:0},
  due_amount:{type:Number,default:0},
  notes:{type:String},
  created_by:{ type:mongoose.Schema.Types.ObjectId,ref:"User",required:false,},
      updated_by:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
      updated_by_role:String,
      updatedAt:Date,
       history: {
      oldValue: String,
      newValue: String
    },
  items:[SaleItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
