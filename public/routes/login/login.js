require("dotenv").config();
const express= require("express");
const jwt=require("jsonwebtoken");
const router=express.Router();
const bcrypt=require ("bcrypt");

const saltRounds = 10;


const userModel=require("../../models/userModel");


router.get("/login",(req,res)=>{
    res.json({Page:"login"});
});


router.post("/login",(req,res)=>{
    User=new userModel({
        email:req.body.email,
        password:req.body.password,
    });
    userModel.findOne({ email: User.email }, (err, result1) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ err: "server error" });
        }
        if (result1) {
            bcrypt.compare(User.password, result1.password, function(err, result2) {
                if(result2)
                {
                    const payload={
                        user:{
                            id:result1._id
                        }
                    }
                    jwt.sign(payload,process.env['JWT'],(err,token)=>{
                        if(err)
                        {
                            console.error(err);
                            return res.status(500).json({ err: "server error" });
                        }
                        res.json({"credentials":"valid",token:token});
                    });
                }
                else
                {
                    res.json({"credentials":"invalid"});
                }
            });
        }
        else
        {
            res.json({"credentials":"invalid"});

        }
    })
});
module.exports=router;