const mongoose=require("mongoose")

const gstreportSchema = new mongoose.Schema({
    report_type:{type:String},
    from_date:{type:Date,required:true},
    to_date:{type:Date,required:true},
    customer_id:{type:mongoose.Schema.Types.ObjectId,ref:"Customer"},
    supplier_id:{type:mongoose.Schema.Types.ObjectId,ref:"Supplier"},
    hsn:{type:String},
    state_code:{type:String},
})

module.exports = mongoose.model("GSTreport",gstreportSchema)