const express = require('express');
const { createCategory, getAllCategories, getCategory, updateCategory, deleteCategory } = require('../controller/categoryCtrl');
const { isAdmin, authMiddleWare } = require('../middlewares/authMiddleWare');
const router = express.Router();

router.post('/',authMiddleWare,isAdmin,createCategory)
router.get('/all',getAllCategories)
router.get('/:id',getCategory)
router.put('/:id',authMiddleWare,isAdmin,updateCategory)
router.delete('/:id',authMiddleWare,isAdmin,deleteCategory)


module.exports = router;