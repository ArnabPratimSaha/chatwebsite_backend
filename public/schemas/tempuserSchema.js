const mongoose=require("mongoose");
const express=require("express");
const { use } = require("../routes/register/register");
require("dotenv").config();

mongoose.connect(process.env["MONGODBDATABASE"], {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const tempUserSchema=new mongoose.Schema({
    userName:{type:String,trim:true},
    email:{type:String,trim:true},
    token:{
        code:{type:Array},
        expireIn:{type:Date}
    }
});

module.exports=tempUserSchema;