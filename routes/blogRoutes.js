// blogRoutes.js

const express = require("express");
const router = express.Router();
const { createBlog, getBlog, getAllBlogs, updateBlog, deleteBlog } = require("../controller/blogCtrl");
const { isAdmin, authMiddleWare } = require('../middlewares/authMiddleWare');

// Create a new blog post
router.post('/', authMiddleWare, isAdmin, createBlog);

// Get all blog posts
router.get('/all', getAllBlogs);

// Get a single blog post by ID
router.get('/:id', getBlog);

// Update a blog post
router.put('/:id', authMiddleWare, isAdmin, updateBlog);

// Delete a blog post
router.delete('/:id', authMiddleWare, isAdmin, deleteBlog);

module.exports = router;
