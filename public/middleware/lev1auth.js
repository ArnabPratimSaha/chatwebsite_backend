require("dotenv").config();
const jwt=require("jsonwebtoken");
const bcrypt=require ("bcrypt");
const express= require("express");
const router=express.Router();

const saltRounds = 10;

const userModel=require("../models/userModel");

const lev1auth=(req,res,next)=>{
    const token=req.header("x-auth-token");
    if(!token)
    {
        return res.status(200).send("no token");
    }
    try
    {
        const decode=jwt.verify(token,process.env["JWT"]);
        userModel.findOne({ _id: decode.user.id },(err,result)=>{
            if(err)
            {
                return res.status(500).json({"server":"error"});
            }
            if(!result)
            {
                return res.json({"access":"denied"});
            }
            return res.json({"access":"granted"});
        });
    }
    catch(err)
    {
        return res.status(200).send("invalid token");
    }
}
module.exports=lev1auth;