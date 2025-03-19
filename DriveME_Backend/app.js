const express=require("express");
const app=express();
const mongoose = require ("mongoose");
const mongoose="mongodb+srv://ashanrulz555:admin@cluster0.mpe19.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


mongoose.connect(mongoUrl).then(()=>{
    console.log("Database Connected");
})
.catch((e)=>{
    console.log(e);
}); 

require('./UserDetails')
const User=mongoose.model("UserInfo");

app.get("/",(req,res)=>{
    res.send({status:"Started"});

})


app.post('register',async(req,res)=>{
    const {name,email,mobile,password} = req.body;

   const olduser=await  User.findOne({email:email});
   if(olduser){
    return res.send({data:"User already exists "});
   }
    try {
        await User.create({
            name:name,
            email:email,
            mobile,
            password,
        })
        res.send({status:"ok",data:"User Created"});
    } catch (error) {
        res.send({status:"Error",data:error});
    }
   
    });
    


app.listen(5001,()=>{
    console.log("Node js server started");
});