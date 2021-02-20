const express= require("express");
const router=express.Router();


const lev1auth=require("../../middleware/lev1auth");

router.get("/auth1",lev1auth,(req,res)=>{
    
});
module.exports=router;