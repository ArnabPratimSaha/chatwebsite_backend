const mongoose=require("mongoose");

mongoose.connect(process.env["MONGODBDATABASE"], {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);


const completeChat=new mongoose.Schema({
    firstUser:String,
    secondUser:String,
    chatdata:[
        {
            senderEmail:String,
            reciverEmail:String,
            massageBody:String,
            time:String
        }
    ]
});
module.exports=completeChat;