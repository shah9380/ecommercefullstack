const expressAsyncHandler = require('express-async-handler');
const Product = require("../model/productModel")
const slugify = require('slugify')

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

            //limiting the 
            const allProducts = await query;
            res.json(allProducts)
        } catch (error) {
            throw new Error('not able to give all the products')
        }
    }
)
module.exports = {createProduct, getaProduct, getAllProducts, updateaProduct, deleteaProduct}