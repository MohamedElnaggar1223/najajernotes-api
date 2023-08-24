const express = require('express')
const router = express.Router()
const { getAllUsers, getUser, createNewUser, updateUser, deleteUser } = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .patch(updateUser)
    .delete(deleteUser)

router.route('/:id')
    .get(getUser)

module.exports = router