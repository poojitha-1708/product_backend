const User=require("../models/users");
const bcrypt=require("bcryptjs");
const { maketoken }=require("../utils/makeToken");
exports.register=async(req,res,next)=>{
    try{
        const {name,email,password,confirmpassword}=req.body;
        if(!name){
            return res.status(404).json({message:"Name not found"});
        }
        if(!email){
            return res.status(404).json({message:"Email not found"});
        }
        if(!password || !confirmpassword){
            return res.status(404).json({message:"Password and confirm password are required"});
        }
        if(password!==confirmpassword){
            return res.status(400).json({message:"Passwords do not match"});
        }
        if(password.length<8){
            return res.status(400).json({message:"Password must be at least 8 characters long"});
        }
        const hashed=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashed});
        res.status(201).json({
            id:user._id,
            name:user.name,
            email:user.email
        });
    } catch (error) {
        next(error);
    }
}

exports.login=async(req,res,next)=>{
  try {
    const {email,password}=req.body;
    if(!email){
        return res.status(401).json({
            message:"Email Not Found"
        })
    }
    if(!password){
        return res.status(401).json({
            message:"Password Not Found"
        })
    }
    const user=await User.findOne({email}).select("+password");
    if(!user){
        return res.status(401).json({
            message:"User doesn't exist"
        })
    }
    
    const ok=await bcrypt.compare(password,user.password);
    if(!ok){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }
    res.status(200).json({
        token:await maketoken(user)
    });
    }catch(error){
        next(error);
    }
}