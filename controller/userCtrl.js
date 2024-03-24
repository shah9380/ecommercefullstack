const expressAsyncHandler = require('express-async-handler');
const User = require('../model/userModel');

//controller logic for creating a user
const createUser = expressAsyncHandler(
    async (req, res)=>{
        //getting the user typed mail
        const email = req.body.email;
    
        //finding a user in data base
        const findUser = await User.findOne({email: email});
    
        if(!findUser){
            //creating a new user if user doesn't exist
            const newUser = await User.create(req.body);
            res.json(newUser);
        }else{
            //sending back the message that user already exists
            throw new Error('User Already Exists');
        }
    }
    
)

//controller for login the user
const loginUser = expressAsyncHandler(
    async (req, res)=>{
        const {email, password} = req.body;
        //check if user exist or not 
        const findUser = await User.findOne({email});
        if(findUser && await findUser.isPasswordMatched(password)){
            res.json(findUser);
        }else{
            throw new Error("Invalid Credendials")
        }
    }
)

module.exports = { createUser, loginUser };