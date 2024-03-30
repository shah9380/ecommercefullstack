const express = require("express");
const { createProduct, getaProduct, getAllProducts, updateaProduct } = require("../controller/productCtrl");
const router = express.Router();

router.post('/', createProduct)
router.get('/all',getAllProducts)  
router.get('/:id', getaProduct)
router.put('/:id',updateaProduct)
 

module.exports = router;