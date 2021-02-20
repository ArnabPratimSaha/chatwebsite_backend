require("dotenv").config();
const express= require("express");
const router=express.Router();
const userModel=require("../../models/userModel");
const jwt=require("jsonwebtoken");

router.post("/friend",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);

    userModel.find({username:req.body.username},(err,result)=>{
        const finalFile={
            names:[],
            email:[]
        }
        if(err)
        {
            return res.status(500).json({ err: "server error" });
        }
        if(result.length==0)
        {
            
            return res.json({finalFile});
        }
        if(result.length==1 && result[0]._id==decode.user.id)
        {
            return res.json({finalFile});
        }
        result.forEach((item)=>{
            if(item._id!=decode.user.id)
            {
                finalFile.email.push(item.email);
                finalFile.names.push(item.username);
            }
            
        });
        res.json({finalFile});
    })
});
module.exports=router;