const expressAsyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const { generateToken } = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongoDbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const { sendaMail } = require('./emailCtrl');
const crypto = require('crypto')

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
            const refreshToken = await generateRefreshToken(findUser?._id);
            const updateUser = await User.findOneAndUpdate(findUser?._id, {
                refreshToken: refreshToken,
            }, {
                new: true
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
            res.json(
                {
                    _id: findUser?._id,
                    firstname: findUser?.firstname,
                    lastname: findUser?.lastname,
                    email: findUser?.email,
                    token: generateToken(findUser?._id)
                }
            );
        }else{
            throw new Error("Invalid Credendials")
        }
    }
)

//admin login 
const loginAdmin = expressAsyncHandler(
    async (req, res)=>{
        const {email, password} = req.body;
        //check if user exist or not 
        const findAdmin = await User.findOne({email});
        if(findAdmin.role.toLowerCase() !== "admin") throw new Error("you are not authorized user for this")
        if(findAdmin && await findAdmin.isPasswordMatched(password)){
            const refreshToken = await generateRefreshToken(findAdmin?._id);
            const updateAdmin = await User.findOneAndUpdate(findAdmin?._id, {
                refreshToken: refreshToken,
            }, {
                new: true
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
            res.json(
                {
                    _id: findAdmin?._id,
                    firstname: findAdmin?.firstname,
                    lastname: findAdmin?.lastname,
                    email: findAdmin?.email,
                    token: generateToken(findAdmin?._id)
                }
            );
        }else{
            throw new Error("Invalid Credendials")
        }
    }
)

//handle the refresh token
const handleRefreshToken = expressAsyncHandler(
    async (req, res)=>{
        const cookie = req.cookies;
        
        if(!cookie?.refreshToken) throw new Error("No refresh token in cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({refreshToken})
        if(!user) throw new Error(" No refresh token matched with any user in DB");
        jwt.verify(refreshToken, process.env.JWT_SECRETKEY, (err, decoded)=>{
            if(err || user.id !== decoded.id){
                throw new Error('There is something wrong with refresh token')
            }
            const accessToken = generateToken(user?._id);
            res.json({ accessToken })
        });
    }
)

//logout the user 
const logout = expressAsyncHandler(
    async (req, res)=>{
        const cookie = req.cookies;
        const refreshToken = cookie.refreshToken;
        if(!refreshToken) throw new Error("No refresh token in cookies");
        const user = await User.findOne({refreshToken})
        if(!user){
            res.clearCookie('refreshToken',{
                httpOnly: true,
                secure: true
            });
            return res.sendStatus(204);
        }
        await User.findOneAndUpdate(user, {
            refreshToken: "",
        })
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: true
        });
        res.sendStatus(204);
    }
)

//controller logic for updating a user
const updateUser = expressAsyncHandler(
    async (req, res)=>{
        const { _id } = req.user;
        validateMongoDbId(_id);
        try {
            const updateUser = await User.findByIdAndUpdate(_id, {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile
            },{
                new: true,
            });
            res.json(updateUser);
        } catch (error) {
            throw new Error(error);
        }
    }
)

//fetching a single user using Id 
const getUser = expressAsyncHandler(
    async (req, res)=>{
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const user = await User.findById(id);
            res.json(user);
        } catch (error) {
            throw new Error(error)
        }
    }
)

//deleting a user using it's ID
const deleteUser = expressAsyncHandler(
    async (req, res)=>{
        const {id} = req.params;
        validateMongoDbId(id);
        try {
            
            const user = await User.findByIdAndDelete(id);
            res.json({
                deletedUser: user
            })
            
        } catch (error) {
            throw new Error(error)
        }
        
    }
)

//controller logic for fetching all the users present 
const getAllUsers = expressAsyncHandler(
    async (req, res)=>{
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            throw new Error(error);
        }
    }
)

const updatePassword = expressAsyncHandler(
    async(req, res)=>{
        const {_id} =req.user;
        const {password} = req.body;
        try {
            validateMongoDbId(_id);
            const user = await User.findById(_id);
            if(password){
                    user.password = password;
                    const updatedPassword = await user.save();
                    res.json(updatedPassword);
            }else{
                res.json(user);
            }
        } catch (error) {
            throw new Error(error)
        }
    }
)

//forgot password token generation with mail sending
const forgetPasswordToken = expressAsyncHandler(
    async(req, res)=>{
        const {email} =  req.body;
        const user = await User.findOne({email});
        if(!user){
            throw new Error("User not found")
        }
        try {
            const token = await user.createPasswordResetToken();
            // we are saving it becuse in the createPasswordResetToken method we are geeratiing timestamps
            await user.save();
            const resetURL = `Hi, Please follwow this link for resetting your passsword. this is valid till 10 minutes from now. <a href='http:localhost:5000/api/user/reset-password/${token}'>Click Here</a>`;
            const data = {
                to: email,
                text:"Hey user",
                subject: "Forgot password link",
                htm:resetURL,
            }
            //sending a mail
           sendaMail(data)
           res.json(token);
        } catch (error) {
            throw new Error(error)
        }
    }
)

//reset password api 
const resetPassword =  expressAsyncHandler(
    async (req, res)=>{
        const {password} = req.body;
        const {token} = req.params;
        //sha256 is just a parrameter of crypto
        const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
        try {
            const user  = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: {$gt: Date.now()}
            })
            if(!user){
                throw new Error("token expired please try again later")
            }
            user.password = password;
            //after once resetting I don't want it to reset it back
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            res.json(user);
        } catch (error) {
            throw new Error(error);
        }
    }
)

const getWishlist = expressAsyncHandler(
    async(req, res)=>{
        const {_id} = req.user;
        try {
            const findUser =  await User.findById(_id);
            res.json(findUser)
        } catch (error) {
            throw new Error(error)
        }
    }
)

module.exports = { createUser, loginUser, getAllUsers, updateUser, getUser, deleteUser, handleRefreshToken, logout, updatePassword, forgetPasswordToken, resetPassword, loginAdmin, getWishlist};