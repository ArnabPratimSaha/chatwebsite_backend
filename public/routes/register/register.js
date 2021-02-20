require("dotenv").config();
const express= require("express");
const jwt=require("jsonwebtoken");
const router=express.Router();
const bcrypt=require ("bcrypt");

const saltRounds = 10;


const userModel=require("../../models/userModel");


router.get("/register",(req,res)=>{
    res.json({Page:"register"});
});


router.post("/register",(req,res)=>{

    User=new userModel({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        registrationdate:new Date()
    });
    var ID=null;
    userModel.findOne({email:User.email},(err,result)=>{
        if(err){
            console.error(err);
            return res.status(500).json({err:"server error"});
        }
        if(result)
        {
            return res.json({"credentials":"invalid"});
        }

        bcrypt.genSalt(saltRounds, (err, salt)=> {
            bcrypt.hash(User.password, salt, function(err, hash) {
                if(err)
                {
                    console.error(err);
                    return res.status(500).json({server :"server error"});
                }
                User.password=hash;
                ID=User._id;
                User.save();
                const payload={
                    user:{
                        id:ID
                    }
                }
                jwt.sign(payload,process.env['JWT'],(err,token)=>{
                    if(err)
                    {
                        console.error(err);
                    }
                    res.json({"credentials":"valid",token:token});
                });
            });
        });
    })  
});

module.exports=router;