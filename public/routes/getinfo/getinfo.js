const express=require("express");
const router=express.Router();
const jwt=require("jsonwebtoken");

const userModel=require("../../models/userModel");

router.get("/get",(req,res)=>{
    if(!req.query.token)
    {
        return res.json({"status":"bad getway"});
    }
    const token=req.query.token;
    const decode=jwt.verify(token,process.env["JWT"]);
    userModel.findOne({_id:decode.user.id},(err,result)=>
    {
        if(err)
        {
            throw err;
        }
        else
        {
            if(!result)
            {
                return res.json({"status":"no users"});
            }
            else
            {
                res.json({"status":"found","info":{
                    "userName":result.username,
                    "email":result.email,
                    "friends":result.friends
                }})
            }
        }
    })

})

module.exports=router;