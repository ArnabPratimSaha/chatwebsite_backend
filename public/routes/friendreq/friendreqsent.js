require("dotenv").config();
const express=require("express");
const router=express.Router();
const jwt=require("jsonwebtoken");
const mongoose =require("mongoose");
const { eventNames } = require("../../models/userModel");

const userModel=require("../../models/userModel");

mongoose.set('useFindAndModify', false);

const findkey=(arr,key)=>{
    for(let i=0;i<arr.length;i++)
    {
        if(arr[i]===key)
        {
            return true;
        }
    }
    return false;
}
const findFriend=(arr,key)=>{
    for(let i=0;i<arr.length;i++)
    {
        if(arr[i]==key)
        {
            return true;
        }
    }
    return false;
}
//send a friend request
router.post("/friend/send",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);
    const email=req.body.email;
    userModel.findOne({_id:decode.user.id},(err,result)=>{
        if(err)
        {
            console.error(err);
            return res.json({ err: "server error" });
        }
        else
        {
            const allFriends=result.friends;
            if(findFriend(allFriends,email))
            {
                return res.json({ res : 1});
            }
            if(findkey(result.friendreqsent,email))
            {
                return res.json({ res : 2});
            }
            userModel.findOne({email:email},(err,result2)=>{
                if (err) {
                    console.error(err);
                    return res.json({ err: "server error" });
                }
                userModel.findOneAndUpdate({email:result.email},{ $push: { friendreqsent : result2.email} },(err,success)=>
                {
                    if(err)
                    {
                        console.error(err);
                    }
                });
                userModel.findOneAndUpdate({email:result2.email},{ $push: { friendreqrecived : result.email} },(err,success)=>
                {
                    if(err)
                    {
                        console.error(err);
                    }
                });
                return res.json({ res : 3});
            })
            
        }
    });

});

const getName= (arr)=>
{
    let temparr=[];
    for(let i=0;i<arr.length;i++)
    {
        temparr.push(arr[i].username);
    }
    
    return temparr;
}
//see all the recived friend request
router.get("/friend/recreq",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);
    userModel.findOne({_id:decode.user.id},(err,result)=>{
        if(err)
        {
            console.error(err);
            return res.json({ err: "server error" });
        }
        userModel.find({ email: { $in: result.friendreqrecived } }, (err, result2) => {
            const allNames=getName(result2); 
            res.json({ names: allNames, emails: result.friendreqrecived });
        });
    })
});
//see all the friend request sent
router.get("/friend/sentreq",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);
    userModel.findOne({_id:decode.user.id},(err,result)=>{
        if(err)
        {
            console.error(err);
            return res.json({ err: "server error" });
        }
        userModel.find({ email: { $in: result.friendreqsent } }, (err, result2) => {
            const allNames=getName(result2); 
            res.json({ names: allNames, emails: result.friendreqsent });
        });
    })
});

//accept the friend req
router.post("/friend/recreq/accept",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);
    const email=req.body.email;

    userModel.findOne({ _id: decode.user.id }, (err, result) => {
        if (!findFriend(result.friends, email)) {
            userModel.findOneAndUpdate({ _id: decode.user.id }, { $push: { friends: email } }, (err, success1) => {
                var anotheremail = success1.email;
                userModel.findOneAndUpdate({ email: email }, { $push: { friends: anotheremail } }, (err, success2) => {
                    userModel.findOneAndUpdate({ _id: decode.user.id }, { $pull: { friendreqrecived: email } }, (err, succ) => {
                        userModel.findOneAndUpdate({ email: email }, { $pull: { friendreqsent: anotheremail } }, (err, succ) => {
                            res.json({ "done": true });
                        })
                    })
                });
            });
        }
    })
});
//reject the recived friend request
router.post("/friend/recreq/reject",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);
    const email=req.body.email;

    userModel.findOne({ _id: decode.user.id }, (err, result) => {
        var anotheremail = result.email;
        userModel.findOneAndUpdate({ _id: decode.user.id }, { $pull: { friendreqrecived: email } }, (err, succ) => {
            userModel.findOneAndUpdate({ email: email }, { $pull: { friendreqsent: anotheremail } }, (err, succ) => {
                res.json({ "done": true });
            })
        })
    })
})
//cancel the sent friend request
router.post("/friend/sentreq/reject",(req,res)=>{
    const decode=jwt.verify(req.header("x-auth-token"),process.env["JWT"]);
    const email=req.body.email;

    userModel.findOne({ _id: decode.user.id }, (err, result) => {
        var anotheremail = result.email;
        userModel.findOneAndUpdate({ _id: decode.user.id }, { $pull: { friendreqsent: email } }, (err, succ) => {
            userModel.findOneAndUpdate({ email: email }, { $pull: { friendreqrecived: anotheremail } }, (err, succ) => {
                res.json({ "done": true });
            })
        })
    })
})

module.exports=router;
