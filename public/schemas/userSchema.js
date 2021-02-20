const mongoose=require("mongoose");
const express=require("express");
const { use } = require("../routes/register/register");
require("dotenv").config();

mongoose.connect(process.env["MONGODBDATABASE"], {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        required: true

    },
    password:{
        type:String,
        required: true

    },
    registrationdate:Date,
    friendreqsent:[String],
    friendreqrecived:[String],
    friends:[String],
    chat:[
        {
            email:String,
            ID:String
        }
    ]
});
module.exports=userSchema;