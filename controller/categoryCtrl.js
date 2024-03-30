const expressAsyncHandler = require('express-async-handler')
const Category = require('../model/categoryModel')

const createCategory = expressAsyncHandler(
    async (req, res)=>{
        try {
            const newCategory = await Category.create(req.body);
            res.json(newCategory)
        } catch (error) {
            throw new Error(error)
        }
    }
)

// Update a category post
const updateCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a category 
const deleteCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single category post
const getCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);
        res.json(category);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all category posts
const getAllCategories = expressAsyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategories };