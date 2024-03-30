const express = require("express");
const { createProduct, getaProduct, getAllProducts, updateaProduct, deleteaProduct, addToWishList } = require("../controller/productCtrl");
const router = express.Router();
const {isAdmin, authMiddleWare} = require('../middlewares/authMiddleWare')

router.post('/',authMiddleWare,isAdmin, createProduct)
router.get('/all',getAllProducts)  
router.get('/:id', getaProduct)
router.put('/wishlist',authMiddleWare,addToWishList)
router.put('/:id',authMiddleWare,isAdmin, updateaProduct)
router.delete('/:id',authMiddleWare,isAdmin, deleteaProduct)
 

module.exports = router;