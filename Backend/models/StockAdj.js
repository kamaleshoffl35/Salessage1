const mongoose = require("mongoose")
const stockAdjSchema = new mongoose.Schema({
    warehouse_id:{type:mongoose.Schema.Types.ObjectId, ref:'Warehouse'},
    created_by_role:{type:String,required:true},
    reason:{type:String,required:true},
    date:{type:Date, required:true},
    notes:{type:String},
    created_by:{type:mongoose.Schema.Types.ObjectId,ref:"User",requried:false},
    updated_by:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    updated_by_role:String,
    updatedAt:Date,
    history:{
        oldValue:String,
        newValue:String,
    },
    items:[{
        product_id:{type:mongoose.Schema.Types.ObjectId, ref:'Product'},
        batch:{type:String},
        qty:{type:String},
        remarks:{type:String},
    }]
},{timestamps:true})

module.exports = mongoose.model('StockAdj',stockAdjSchema)