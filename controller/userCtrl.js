const expressAsyncHandler = require('express-async-handler');
const User = require('../model/userModel');


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
module.exports = { createUser };