const mongoose=require("mongoose");
const userSchema=require("../schemas/userSchema");

module.exports= userModel=mongoose.model('UserModel', userSchema);