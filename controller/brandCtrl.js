const expressAsyncHandler = require('express-async-handler')
const Brand = require('../model/brandModel')

const createBrand = expressAsyncHandler(
    async (req, res)=>{
        try {
            const newBrand = await Brand.create(req.body);
            res.json(newBrand)
        } catch (error) {
            throw new Error(error)
        }
    }
)

// Update a brand post
const updateBrand = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a brand 
const deleteBrand = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single brand post
const getBrand = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await Brand.findById(id);
        res.json(brand);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all brand posts
const getAllBrands = expressAsyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createBrand, updateBrand, deleteBrand, getBrand, getAllBrands };