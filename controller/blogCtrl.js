// blogController.js

const expressAsyncHandler = require('express-async-handler');
const Blog = require("../model/blogModel");
const slugify = require('slugify');

// Create a new blog post
const createBlog = expressAsyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Update a blog post
const updateBlog = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a blog post
const deleteBlog = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single blog post
const getBlog = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findById(id);
        res.json(blog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all blog posts
const getAllBlogs = expressAsyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createBlog, updateBlog, deleteBlog, getBlog, getAllBlogs };
