require("dotenv").config();
const express= require("express");
const jwt=require("jsonwebtoken");
const router=express.Router();


router.get("/",(req,res)=>{
    const token=req.header("x-auth-token");
    jwt.verify(token, process.env["JWT"], function(err, decoded) {
        if(err)
        {
            res.json({status:false});
        }
        else
        {
            res.json({status:true});
        }

    });
});

module.exports=router;
