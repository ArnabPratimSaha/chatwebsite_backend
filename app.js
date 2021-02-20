const express=require("express");
const bodyParser=require("body-parser");
var jwt = require('jsonwebtoken');
var cors = require('cors');

const registerRoute=require("./public/routes/register/register");
const authRoute1=require("./public/routes/auth/authpage1");
const loginRoute=require("./public/routes/login/login");
const homeRoute=require("./public/routes/home/home");
const friendRoute=require("./public/routes/friend/friend");
const friendreqsend=require("./public/routes/friendreq/friendreqsent");
const friendreqrec=require("./public/routes/friendreq/friendreqrec");
const chatRoute=require("./public/routes/chat/chatfront");

const app=express();
app.use(bodyParser.json({extended :false}));

app.use(cors());
  
app.use("/home",registerRoute);
app.use("/home",authRoute1);
app.use("/home",loginRoute);
app.use("/home",homeRoute);
app.use("/home",friendRoute);
app.use("/home",friendreqsend);
app.use("/home",friendreqrec);
app.use("/home",chatRoute)


app.listen(process.env.PORT || 5000,()=>{
    console.log("server listening on port 5000");
});
