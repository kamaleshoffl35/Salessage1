const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  phone:{type:String},
  role:{type:String, enum:["super_admin","admin","user"]},
  avatar:{type:String}, 
  address:{type:String},
  password:{type:String,required:true },
  status:{type:String,enum:["active","inactive"],default:"active" },
  resetPasswordToken:{type:String},
  resetPasswordExpires:{type:Date},
}, { timestamps:true });

userSchema.pre("save", async function(next){
  if (!this.isModified("password")) 
    return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch(err) {
    next(err);
  }
});


userSchema.methods.comparePassword=async function(candidate){
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User",userSchema);
