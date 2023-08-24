const express = require('express')
const router = express.Router()
const loginLimiter = require('../middleware/loginLimiter')
const { login, refresh, logout } = require('../controllers/authController')

router.route('/')
    .post(loginLimiter, login)

router.route('/refresh')
    .get((req, res) => refresh(req, res))

router.route('/logout')
    .post(logout)

module.exports = router