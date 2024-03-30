const express = require("express");
const { createProduct, getaProduct, getAllProducts } = require("../controller/productCtrl");
const router = express.Router();

router.post('/', createProduct)
router.get('/all',getAllProducts)
router.get('/:id', getaProduct)


module.exports = router;