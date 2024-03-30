const express = require('express')
const router = express.Router();
const {createUser, loginUser, getAllUsers, updateUser, getUser, deleteUser, handleRefreshToken, logout, updatePassword, forgetPasswordToken, resetPassword} = require('../controller/userCtrl');
const {authMiddleWare, isAdmin} = require('../middlewares/authMiddleWare');


router.post('/register', createUser);
router.post('/forgot-password-token',forgetPasswordToken);
router.post('/reset-password/:token', resetPassword)
router.post('/login', loginUser);
router.get('/refresh',handleRefreshToken);
router.get('/logout',logout)
router.get('/all', getAllUsers);
router.get('/:id',authMiddleWare, isAdmin,getUser);
router.put('/edit-user',authMiddleWare, updateUser);
router.delete('/:id',deleteUser);
//from auth Middle ware we are getting req.user 
router.put('/password',authMiddleWare, updatePassword);


module.exports = router;