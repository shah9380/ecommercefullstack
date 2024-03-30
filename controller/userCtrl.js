const expressAsyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

const User = require('../model/userModel');
const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const Order = require('../model/orderModel');
const { generateToken } = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongoDbId');
const { generateRefreshToken } = require('../config/refreshToken');

const { sendaMail } = require('./emailCtrl');


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

//wishlist fetching

const getWishlist = expressAsyncHandler(
    async(req, res)=>{
        const {_id} = req.user;
        try {
            const findUser =  await User.findById(_id).populate('wishlist');
            //populate means that we will get the whole product by just id we had passed during wishlist generation
            res.json(findUser)
        } catch (error) {
            throw new Error(error)
        }
    }
)


//cart checking and creating
const userCart =  expressAsyncHandler(
    async(req, res)=>{
        const {cart} = req.body;
        const {_id} = req.user;
        validateMongoDbId(_id);
        try {
            let products = []
            const user = await User.findById(_id)
            //check if user already having product in cart which I want to add
            const checkExistCart = await Cart.findOne({orderby: user._id});
            if(checkExistCart){
                checkExistCart.remove();
            }
            for(let i=0;i<cart.length;i++){
                let object ={};
                object.product = cart[i]._id;
                object.count = cart[i].count;
                object.color = cart[i].color;
                let getPrice = await Product.findById(cart[i]._id).select("price").exec();
                object.price = getPrice.price;
                products.push(object);
            }
            let cartTotal = 0;
            for(let i=0;i<products.length;i++){
                cartTotal = cartTotal + products[i].price * products[i].count;
            }
            let newCart = await new Cart({
                products,
                cartTotal,
                cartOwner: user?._id,  
            }).save();
            res.json(newCart)
        } catch (error) {
            throw new Error(error)
        }
    }
)

// fetching the cart
const getuserCart = expressAsyncHandler(
    async(req, res)=>{
        const {_id} = req.user;
        validateMongoDbId(_id);
        try {
            const cart = await Cart.findOne({cartOwner: _id}).populate("products.product", "_id title price totalAfterDiscount")
            res.json(cart);
        } catch (error) {
            throw new Error(error)
        }
    }
)

//Delete or empty for the cart
const emptyCart = expressAsyncHandler(
    async(req, res)=>{
        const {_id} = req.user;
        console.log(req.user);
        validateMongoDbId(_id);
        try {
            const user = await User.findById(_id);
            const cart = await Cart.findOneAndDelete({cartOwner: user._id})
            res.json(cart);
        } catch (error) {
            throw new Error(error)
        }
    }
)

//creating the order functionality

const createOrder = expressAsyncHandler(
    async(req, res)=>{
        const {COD} = req.body;
        const {_id} = req.user;
        validateMongoDbId(_id);
        
        try {
            if(!COD) throw new Error("cash order creation failed");
            const user = await User.findById(_id);
            let userCart = await Cart.findOne({cartOwner: user._id});
            let finalAmount = 0;
            finalAmount = userCart.cartTotal;
            let newOrder = await new Order({
                products: userCart.products,
                paymentIntent: {
                    id: uniqid(),
                    method: "COD",
                    amount: finalAmount,
                    status: "cash on delivery",
                    created: Date.now(),
                    currency: "usd",
                },
                orderBy: user._id,
                orderStatus: "Cash On Delivery",
            }).save();
            //after order we need to update the available quantity and sold quantity
            //dynamic find for bulk updating
            //bulk updating API
            let update = userCart.products.map((item)=>{
                return {
                    updateOne:{
                        filter: {_id: item.product._id},
                        //updating the quantity and sold quantity after order api called
                        update: {$inc: {quantity: -item.count, sold: +item.count}}
                    }
                }
            });
            //updating in bulk we have bulkwrite method
            const updated = await Product.bulkWrite(update,{})
            res.json({message: "success", newOrder})
        } catch(error){
            throw new Error(error)
        }
    }
);

//fetching all the orders
const getOrders = expressAsyncHandler(
    async(req, res)=>{
        const {_id} = req.user;
        validateMongoDbId(_id)
        try {
            const userOrders = await Order.find({orderBy: _id}).populate("products.product").exec()
            res.json(userOrders);
        } catch (error) {
            throw new Error(error);
        }
    }
)

//updating the order status

const updateOrderStatus = expressAsyncHandler(
    async(req, res)=>{
        const {status} = req.body;
        const {id} = req.params;
        validateMongoDbId(id);
        try {
            const updateOrderStatus = await Order.findByIdAndUpdate(id,{orderStatus: status, paymentIntent:{
                // ...paymentIntent,
                status: status,
                // some changes needs to be made in this
            }}, {new : true})
            res.json(updateOrderStatus);
        } catch (error) {
            throw new Error(error)
        }
    }
)


module.exports = { createUser, loginUser, getAllUsers, updateUser, getUser, deleteUser, handleRefreshToken, logout, updatePassword, forgetPasswordToken, resetPassword, loginAdmin, getWishlist, userCart, getuserCart, emptyCart, createOrder, getOrders, updateOrderStatus};