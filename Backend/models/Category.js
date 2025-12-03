const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    parental_id:{type:String},
    name:{type:String,required:true},
    subcategory:{type:String,default:""},
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    created_by_role:{type:String,required:true},
    code:{type:String,required:true},
    // brand:{type:String},
    brands: [{type:String}],
    status:{type:Boolean,default:true},
     updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by_role: String,
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
