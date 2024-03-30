const expressAsyncHandler = require('express-async-handler');
const Product = require("../model/productModel")

//creating a new product
const createProduct = expressAsyncHandler(
    async (req, res)=>{
        try {
            const newProduct = await Product.create(req.body);
            res.json(newProduct);
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
            const allProducts = await Product.find();
            res.json(allProducts)
        } catch (error) {
            throw new Error('not able to give all the products')
        }
    }
)
module.exports = {createProduct, getaProduct, getAllProducts}