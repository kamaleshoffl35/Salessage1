const mongoose = require("mongoose")
const stockAdjSchema = new mongoose.Schema({
    warehouse_id:{type:mongoose.Schema.Types.ObjectId, ref:'Warehouse'},
    created_by_role:{type:String,required:true},
    reason:{type:String,required:true},
    date:{type:Date, required:true},
    notes:{type:String},
    items:[{
        product_id:{type:mongoose.Schema.Types.ObjectId, ref:'Product'},
        batch:{type:String},
        qty:{type:String},
        remarks:{type:String},
    }]
})

module.exports = mongoose.model('StockAdj',stockAdjSchema)