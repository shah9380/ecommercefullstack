const expressAsyncHandler = require('express-async-handler');
const Product = require("../model/productModel")
const slugify = require('slugify')
const User = require('../model/userModel')

//creating a new product
const createProduct = expressAsyncHandler(
    async (req, res)=>{
        try {
            if(req.body.title){
                req.body.slug = slugify(req.body.title);
            }
            const newProduct = await Product.create(req.body);
            res.json(newProduct);
        } catch (error) {
            throw new Error(error)
        }
    }
)

//update a product
const updateaProduct = expressAsyncHandler(
  
    async (req, res)=>{
        const{id} = req.params;
        try {
            if(req.body.title){
                req.body.slug = slugify(req.body.title);
            }
            const updatedProduct = await Product.findByIdAndUpdate(id, req.body,{
                new : true
            })
            res.json(updatedProduct)
        } catch (error) {
            throw new Error(error)
        }
    }
)
//delete a product
const deleteaProduct = expressAsyncHandler(
  
    async (req, res)=>{
        const{id} = req.params;
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            res.json(deletedProduct);
        } catch (error) {
            throw new Error(error)
        }
    }
)


//getting a product
const getaProduct = expressAsyncHandler(
    async (req, res)=>{
        const {id} = req.params;
        try {
            const findProduct = await Product.findById(id);
            res.json(findProduct);
        } catch (error) {
            throw new Error(error)
        }
    }
)


//get all products 

const getAllProducts = expressAsyncHandler(
    async (req, res)=>{
        try {

            //filtering is done
            const queryObj = { ...req.query };
            console.log(queryObj);
            const excludeFields = ["page","limit","sort", "fields"];
            excludeFields.forEach((el)=> delete queryObj[el]);
            console.log(queryObj);
            let queryStr = JSON.stringify(queryObj);
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match)=> `$${match}`);
            let query = Product.find(JSON.parse(queryStr));

            //sorting of products
            if(req.query.sort){
                const sortBy =  req.query.sort.split(',').join(" ");
                query = query.sort(sortBy);
            }else{
                //error handling
               query = query.sort("-createdAt");
            }

            //limiting the fields
            if(req.query.fields){
                const fields = req.query.fields.split(",").join(" ");
                query = query.select(fields);
            }else{
                //if we don,t want to show mongoose __v
                query = query.select('-__v')
            }

            //pagination
            const page = req.query.page;
            const limit = req.query.limit;
            //let limit is 3
            //if page is 2 we are skipping the previous 3 products if page is 3 we will skip 2*3 means 6 products this means 2 pages skipped
            const skip = (page -1)* limit;
            query = query.skip(skip).limit(limit);
            if(req.query.page){
                const productCount = await Product.countDocuments();
                if(skip >= productCount) throw new Error("This page does not exist");
            }

            const allProducts = await query;
            res.json(allProducts)
        } catch (error) {
            throw new Error('not able to give all the products')
        }
    }
)


const addToWishList =  expressAsyncHandler(
    async (req, res)=>{
        const {_id} = req.user;
        const {prodId} = req.body;
        try {
            const user = await User.findById(_id);
            const alreadyAdded = await user.wishlist.find((id)=>id.toString() === prodId);
            //if it is already added then we will find the user and remove or pull the prodId from wishlist
            if(alreadyAdded){
                let user = await User.findByIdAndUpdate(_id, {
                    $pull: {wishlist: prodId}
                },{
                    new:true
                })
                res.json(user);
            }else{ 
                let user = await User.findByIdAndUpdate(_id, {
                    $push: {wishlist: prodId} // if not present then we will push the product to the particular user
                },{
                    new:true
                })
                res.json(user);
            }
        } catch (error) {
            throw new Error(error)
        }
    }
)
module.exports = {createProduct, getaProduct, getAllProducts, updateaProduct, deleteaProduct, addToWishList}