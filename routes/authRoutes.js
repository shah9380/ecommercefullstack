const express = require('express')
const router = express.Router();
const {createUser, loginUser, getAllUsers, updateUser, getUser, deleteUser} = require('../controller/userCtrl');
const {authMiddleWare, isAdmin} = require('../middlewares/authMiddleWare');


router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/all', getAllUsers);
router.get('/:id',authMiddleWare, isAdmin,getUser);
router.put('/edit-user',authMiddleWare, updateUser);
router.delete('/:id',deleteUser);

module.exports = router;