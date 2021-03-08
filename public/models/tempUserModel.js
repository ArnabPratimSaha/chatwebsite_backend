const tempUserSchema=require("../schemas/tempuserSchema");
const mongoose=require("mongoose");

module.exports=tempUserModel=new mongoose.model("tempUserModel",tempUserSchema);
