// blogModel.js

const mongoose = require('mongoose');
const slugify = require('slugify');

// Define the schema for the blog post
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true // Enable timestamps for createdAt and updatedAt fields
});

// Create a pre-save middleware to generate the slug before saving the document
blogSchema.pre('save', function (next) {
    if (!this.isModified('title')) {
        return next();
    }
    this.slug = slugify(this.title, { lower: true });
    next();
});

// Create a model for the blog post using the schema
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
