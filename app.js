const express=require("express");
const bodyParser=require("body-parser");
var jwt = require('jsonwebtoken');
var cors = require('cors');

const socket=require("socket.io");
const http=require("http"); 


const registerRoute=require("./public/routes/register/register");
const authRoute1=require("./public/routes/auth/authpage1");
const loginRoute=require("./public/routes/login/login");
const homeRoute=require("./public/routes/home/home");
const friendRoute=require("./public/routes/friend/friend");
const friendreqsend=require("./public/routes/friendreq/friendreqsent");
const friendreqrec=require("./public/routes/friendreq/friendreqrec");
const {router,decodeMassage,decodeOBJ,findID,encodeMassage}=require("./public/routes/chat/chatfront");
const GetInfoRoute=require("./public/routes/getinfo/getinfo");

const userModel=require("./public/models/userModel");
const chatModel=require("./public/models/chatModel");
const { json } = require("body-parser");

const app=express();
const server=http.createServer(app);

app.use(express.json({extended :false}));
app.use(cors());

const io=socket(server,{
    path: "/singlechat/",
    cors: {
        origin: '*',
    }
});
app.use("/home",registerRoute);
app.use("/home",authRoute1);
app.use("/home",loginRoute);
app.use("/home",homeRoute);
app.use("/home",friendRoute);
app.use("/home",friendreqsend);
app.use("/home",friendreqrec);
app.use("/home",router);
app.use("/home",GetInfoRoute);

io.on("connection", socket => {

    socket.on("getChatInfo",({email1,email2},callback)=>
    {
        const token=[email1,email2].sort();
        const finalToken=token[0]+" "+token[1];
        socket.join(finalToken);
        userModel.findOne({email:email1},(err,response)=>{
            if(err)
            {
                throw err;
            }
            if(response)
            {
                const chatID=findID(response.chat,email2);
                if(chatID)
                {
                    chatModel.findOne({_id:chatID},(err,result)=>{
                        if(err)
                        {
                            throw err;
                        }
                        if(result)
                        {
                            const roomInfo=io.sockets.adapter.rooms.get(finalToken);
                            var array=[];
                            if(roomInfo)
                            {
                                roomInfo.forEach(element => {
                                    array.push(element)
                                });
                            }
                            if(result.chatdata.length>50)
                            {
                                chatModel.findOneAndUpdate({_id:chatID},{$pop:{chatdata:-1}},(err,result1)=>{
                                    io.to(finalToken).emit('chatData', {chat:decodeOBJ(result1.chatdata),id:array});
                                });
                            }
                            else
                            {
                                io.to(finalToken).emit('chatData', {chat:decodeOBJ(result.chatdata),id:array});
                            }
                            callback();
                        }
                    });
                }
            }
        });
    });
    socket.on("sendMassage",({senderEmail,reciverEmail,massage,time},callback)=>{
        const token=[senderEmail,reciverEmail].sort();
        const finalToken=token[0]+" "+token[1];
        const roomInfo=io.sockets.adapter.rooms.get(finalToken);
                            var array=[];
                            roomInfo.forEach(element => {
                                array.push(element)
                            });
        userModel.findOne({email:senderEmail},(err,response)=>{
            if(err)
            {
                throw err;
            }
            if(response)
            {
                const chatID=findID(response.chat,reciverEmail);
                if(chatID)
                {
                    chatModel.findOneAndUpdate({ _id: chatID }, {
                        $push: {
                            chatdata: {
                                senderEmail: encodeMassage(senderEmail),
                                reciverEmail: encodeMassage(reciverEmail),
                                massageBody: encodeMassage(massage),
                                time: encodeMassage(time)
                            }
                        }
                    }, (err, success1) => {
                        chatModel.findOne({_id:chatID},(err,success2)=>{
                            
                            io.to(finalToken).emit('chatData', {chat:decodeOBJ(success2.chatdata),id:array});
                        })
                    });
                }
                else
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
                                        massageBody: encodeMassage(massage),
                                        time: encodeMassage(time)
                                    }
                                }
                            }, (err, success) => {
                                chatModel.findOne({_id:newChatID},(err,success2)=>{
                                    io.to(finalToken).emit('chatData', {chat:decodeOBJ(success2.chatdata),id:array});
                                    
                                })
                            })
                        })
                    });
                }
                callback();
            }
        });
    });
    socket.on("disconnection",({email1,email2},callback)=>{
        const token=[email1,email2].sort();
        const finalToken=token[0]+" "+token[1];
        const roomInfo=io.sockets.adapter.rooms.get(finalToken);
        var array = [];
        if(roomInfo)
        {
            roomInfo.forEach((element) => {
                array.push(element);
            });
        }
        io.to(finalToken).emit("exit",{id:array});
        socket.disconnect();
        callback();
    });
});

server.listen(process.env.PORT || 5000,()=>{
    console.log("server listening on port 5000");
});
