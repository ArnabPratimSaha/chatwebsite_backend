require("dotenv").config();
const express= require("express");
const jwt=require("jsonwebtoken");
const router=express.Router();

const userModel=require("../../models/userModel");

router.get("/getname",(req,res)=>{
    const token=req.header("x-auth-token");
    jwt.verify(token, process.env["JWT"], function(err, decoded) {
        if(err)
        {
            res.json({status:false});
        }
        else
        {
            userModel.findOne({_id:decoded.user.id},(err,result)=>{
                if(err)
                {
                    res.json({"status":false});
                }
                if(!result)
                {
                    res.json({"status":false});
                }
                else
                {
                    res.json({"status":true,"name":result.username});
                }
            })
        }
    });
});

module.exports=router;
