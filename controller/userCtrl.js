const User = require('../model/userModel');



const createUser = async (req, res)=>{
    //getting the user typed mail
    const email = req.body.email;

    //finding a user in data base
    const findUser = await User.findOne({email: email});

    if(!findUser){
        //creating a new user if user doesn't exist
        const newUser = User.create(req.body);
        res.json(newUser);
    }else{
        //sending back the message that user already exists
        res.json({
            message: "User Already Exists",
            success: false
        })
    }
}

module.exports = { createUser };