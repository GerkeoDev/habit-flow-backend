const express = require('express')
const oAuthController = require('../controllers/oauth.controller')
const router = express.Router()

router.post('/register', oAuthController.register)
router.post('/login', oAuthController.login)
router.post('/refresh', oAuthController.refresh)
router.post('/logout', oAuthController.logout)
router.get('/me', oAuthController.me)

module.exports = {
    oAuthRouter: router
}