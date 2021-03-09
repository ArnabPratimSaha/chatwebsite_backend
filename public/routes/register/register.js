require("dotenv").config();
const express= require("express");
const jwt=require("jsonwebtoken");
const router=express.Router();
const bcrypt=require ("bcrypt");
const nodemailer = require('nodemailer');

const saltRounds = 10;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
});


const userModel=require("../../models/userModel");
const tempUserModel=require("../../models/tempUserModel");


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

const generateRandomNumber=(number)=>
{
    var array=[];
    for (let i = 0; i < number; i++) {
        array.push(Math.floor(Math.random()*10));
    }
    return array;
}
const converToString=(array)=>
{
    var number="";
    for (let i = 0; i < array.length; i++) {
        number+=array[i];
    }
    return number
}
const manageCode=(tempUser)=>
{
    var mailOptions = {
      from: process.env.EMAIL,
      to: tempUser.email,
      subject: "Welcome To Chatter " + tempUser.userName,
      text:"Welcome " + tempUser.userName +"\nYour signup code is "+converToString(tempUser.token.code)+". \nPLEASE DON'T SHARE THIS WITH OTHERS\n"+"The code is valid for 10 minutes"
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
}
const checkCode=(systemCode,userCode)=>{
    for (let i = 0; i < systemCode.length; i++) {
        if(systemCode[i]!=userCode[i])
            return false;
    }
    return true;
}

router.post("/signup", (req, res) => {
  if (req.body.userName.length < 5 || req.body.email.length < 5) {
    return res.status(404).send("bad getway");
  }
  userModel.findOne({ email: req.body.email }, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ err: "server error" });
    }
    if (response) {
      return res.json({ credentials: "invalid" });
    } else {
      tempUserModel.findOne({ email: req.body.email }, (err, result) => {
        var d1 = new Date(),
          d2 = new Date(d1);
        d2.setMinutes(d1.getMinutes() + 10);
        if (err) {
          console.error(err);
          return res.status(500).json({ err: "server error" });
        }
        if (result) {
          tempUserModel.findOneAndUpdate(
            { email: result.email },
            {
              $set: {
                token: {
                  code: generateRandomNumber(6),
                  expireIn: d2,
                },
              },
            },
            (err, result1) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ err: "server error" });
              }
              tempUserModel.findOne(
                { email: result1.email },
                (err, result2) => {
                  manageCode(result2);
                  return res.json({ credentials: "valid" });
                }
              );
            }
          );
        } else {
          const tempUser = new tempUserModel({
            userName: req.body.userName,
            email: req.body.email,
            token: {
              code: generateRandomNumber(6),
              expireIn: d2,
            },
          });
          manageCode(tempUser);
          tempUser.save();
          return res.json({ credentials: "valid" });
        }
      });
    }
  });
});


router.post("/signup/validate",(req,res)=>{
    if ( req.body.email.length<5 || req.body.code.length<6) {
        return res.status(404).send("bad getway");
    }
    tempUserModel.findOne({email:req.body.email},(err,result)=>{
        if(err){
            console.error(err);
            return res.status(500).json({err:"server error"});
        }
        if(!result)
        {
            return res.json({"credentials":"invalid"});
        }
        const timeNow=new Date();
        if(timeNow>result.token.expireIn)
        {
            return res.json({"credentials":"timedout"});
        }
        else if(checkCode(result.token.code,req.body.code))
        {
            tempUserModel.findOneAndDelete({email:req.body.email},(err,result1)=>{
                if(err || !result1){
                    console.error(err);
                    return res.status(500).json({err:"server error"});
                }
                return res.json({"credentials":"valid"});
            })
        }
        else
        {
            res.json({"credentials":"codeinvalid"});
        }
    })
})


module.exports=router;