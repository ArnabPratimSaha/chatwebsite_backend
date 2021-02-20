const chatSchema=require("../schemas/chatSchema");
const mongoose=require("mongoose");

module.exports=ChatModel=new mongoose.model("ChatModel",chatSchema);


