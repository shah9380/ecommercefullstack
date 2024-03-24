const express = require('express')
const router = express.Router();
const {createUser, loginUser, getAllUsers, updateUser, getUser, deleteUser} = require('../controller/userCtrl')


router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/all', getAllUsers);
router.get('/:id',getUser);
router.put('/:id',updateUser);
router.delete('/:id',deleteUser);

module.exports = router;