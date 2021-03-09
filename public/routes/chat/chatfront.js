require("dotenv").config();
const express=require("express");
const router=express.Router();
const jwt=require("jsonwebtoken");
const mongoose =require("mongoose");
const { eventNames } = require("../../models/userModel");
const CryptoJS = require("crypto-js");

const userModel=require("../../models/userModel");
const chatModel=require("../../models/chatModel");

mongoose.set('useFindAndModify', false);


const encodeMassage=(massage)=>{
   return CryptoJS.AES.encrypt(massage, process.env["SECRET"]).toString();
}
const decodeMassage=(massage)=>
{
    var bytes  = CryptoJS.AES.decrypt(massage, process.env["SECRET"]);
    return bytes.toString(CryptoJS.enc.Utf8);
}
const decodeOBJ=(arr)=>
{
    const array=[];
    arr.forEach(element => {
        
        const temp={
                senderEmail:decodeMassage(element.senderEmail),
                reciverEmail:decodeMassage(element.reciverEmail),
                massageBody:decodeMassage(element.massageBody),
                time:decodeMassage(element.time)
            }
        array.push(temp);
    });
    return array;
}

router.get("/chat/frontpage",(req,res)=>{
    const token=req.header("x-auth-token");
    jwt.verify(token, process.env["JWT"], function(err, decoded) {
        if(err)
        {
            return res.json({ "status": false });
        }
        if(decoded){
            return res.json({ "status": true });
        }
    })
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
router.get("/chat/getfriends",(req,res)=>{
    const token=req.header("x-auth-token");
    const decode=jwt.verify(token,process.env["JWT"]);
    userModel.findOne({_id:decode.user.id},(err,result)=>{
        userModel.find({ email: { $in: result.friends} }, (err, result2) => {
            const allNames=getName(result2); 
            res.json({"emails":result.friends,"names":allNames});

        })
    })
});
router.get("/chat/getfriendreqpending",(req,res)=>{
    const token=req.header("x-auth-token");
    const decode=jwt.verify(token,process.env["JWT"]);
    userModel.findOne({_id:decode.user.id},(err,result)=>{
        res.json({"length":result.friendreqrecived.length});
    })
});



const findID=(arr,email)=>{
    for (let i = 0; i < arr.length; i++) {
        if(arr[i].email==email)
        {
            return arr[i].ID;
        }
    }
    return null;
}

//send a massage
router.post("/chat/sendmassage",(req,res)=>{
    const token=req.header("x-auth-token");
    const decode=jwt.verify(token,process.env["JWT"]);
    userModel.findOne({_id:decode.user.id},(err,result1)=>{
        if(!result1)
        {
            return res.status(404);
        }
        senderEmail=result1.email;
        reciverEmail=req.body.email;
        const chatID=findID(result1.chat,reciverEmail);
        if(chatID==null)
        {
            var newChat=new chatModel({
                firstUser:senderEmail,
                secondUser:reciverEmail,
            });
            newChatID = newChat._id;
            newChat.save();
            userModel.findOneAndUpdate({ email: senderEmail }, { $push: { chat: { email: reciverEmail, ID: newChatID } } }, (err, succ1) => {
                userModel.findOneAndUpdate({ email: reciverEmail }, { $push: { chat: { email: senderEmail, ID: newChatID } } }, (err, succ1) => {
                    chatModel.findOneAndUpdate({ _id: newChatID }, {
                        $push: {
                            chatdata: {
                                senderEmail: encodeMassage(senderEmail),
                                reciverEmail: encodeMassage(reciverEmail),
                                massageBody: encodeMassage(req.body.massage),
                                time: encodeMassage(req.body.time)
                            }
                        }
                    }, (err, success) => {
                        chatModel.findOne({_id:newChatID},(err,success2)=>{
                            res.json({"status":true,"chat":decodeOBJ(success2.chatdata)});
                        })
                    })
                })
            })
        }
        else {
            chatModel.findOneAndUpdate({ _id: chatID }, {
                $push: {
                    chatdata: {
                        senderEmail: encodeMassage(senderEmail),
                        reciverEmail: encodeMassage(reciverEmail),
                        massageBody: encodeMassage(req.body.massage),
                        time: encodeMassage(req.body.time)
                    }
                }
            }, (err, success1) => {
                chatModel.findOne({_id:chatID},(err,success2)=>{
                    
                    console.log();
                    res.json({"status":true,"chat":decodeOBJ(success2.chatdata)});
                })
            })
        }
    })
});

//get all the massage 
router.post("/chat/getallmassages",(req,res)=>{
    const token=req.header("x-auth-token");
    const decode=jwt.verify(token,process.env["JWT"]);
    const reciverEmail=req.body.email;
    userModel.findOne({_id:decode.user.id},(err,result1)=>{
        const senderEmail=result1.email;
        const chatID=findID(result1.chat,reciverEmail);
        if(chatID==null)
        {
            return res.json({"status":false});
        }
        chatModel.findOne({_id:chatID},(err,result2)=>{
            if(result2.chatdata.length>50)
            {
                chatModel.findOneAndUpdate({_id:chatID},{$pop:{chatdata:-1}},(err,result3)=>{
                    res.json({"status":true,"chat":decodeOBJ(result3.chatdata)});
                });
            }
            else
            {
                res.json({"status":true,"chat":decodeOBJ(result2.chatdata)});

            }
        })
    })

})


module.exports={router,findID,decodeOBJ,decodeMassage,encodeMassage};