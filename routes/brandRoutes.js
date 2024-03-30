const express = require('express');
const { createBrand, getAllBrands, getBrand, updateBrand, deleteBrand } = require('../controller/brandCtrl');
const { isAdmin, authMiddleWare } = require('../middlewares/authMiddleWare');
const router = express.Router();

router.post('/',authMiddleWare,isAdmin,createBrand)
router.get('/all',getAllBrands)
router.get('/:id',getBrand)
router.put('/:id',authMiddleWare,isAdmin,updateBrand)
router.delete('/:id',authMiddleWare,isAdmin,deleteBrand)


module.exports = router;