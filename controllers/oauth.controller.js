const {User} = require('../models/User.model')
const { validateLogin, validateRegister } = require('../validators/auth.validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const JWT_SECRET = process.env.JWT_SECRET

const getCookieOptions = () => {
    const isProduction = !process.env.CLIENT_URL?.includes('localhost')
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    }
}

const setAuthCookies = (res, token, refreshToken) => {
    const opts = getCookieOptions()
    res.cookie('token', token, opts)
    res.cookie('refreshToken', refreshToken, opts)
}

const register = async (req, res) => {
    let userData = req.body
    try {
        const errors = validateRegister(userData)
        let existUserWithSameEmail = await User.exists({ email: userData.email })
        let existUserWithSameName = await User.exists({ userName: userData.userName })

        if (!userData.email || !userData.password || !userData.userName) {
            errors.message = "Missing required fields"
            return res.status(400).json({
                success: false,
                errors
            })
        }

        if (existUserWithSameEmail) {
            errors.email = "The email already exists"
        }

        if (existUserWithSameName) {
            errors.userName = "The user name already exists"
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            })
        }

        let hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(userData.password, 10, function(err, hash){
                if (err) reject(err)
                resolve(hash)
            })
        })

        let user = new User({
            email: userData.email,
            userName: userData.userName,
            password: hashedPassword
        })
        await user.save()
        res.json({
            success: true,
            user
        })
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            let errors = {}
            Object.keys(error.errors).map((key) => {
                errors[key] = error.errors[key].message
            })
            res.status(400).json({
                success: false,
                errors
            })
        } else {
            res.status(500).json({
                success: false,
                errors: error.toString()
            })
        }
    }
}

const login = async (req, res) => {
    let data = req.body
    try {
        const errors = validateLogin(data)

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            })
        }

        let user = await User.findOne({ email: data.email })

        if (!user) {
            return res.status(400).json({ 
                success: false,
                errors: {
                    message: 'Invalid credentials'
                }
            })
        }

        let samePassword = await bcrypt.compareSync(data.password, user.password)

        if (samePassword) {
            const payload = {
                id: user._id,
                userName: user.userName
            }

            let token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
            let refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })

            setAuthCookies(res, token, refreshToken)

            res.json({ user: payload, token, refreshToken })
        } else {
            res.status(400).json({ 
                success: false,
                errors: {
                    message: 'Invalid credentials'
                }
            })
        }
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ 
                success: false,
                errors: {
                    message: error.toString()
                }
            })
        } else {
            res.status(500).json({ 
                success: false,
                errors: {
                    message: error.toString()
                }
            })
        }
    }
}

const refresh = (req, res) => {
    let refreshToken = req.body.refreshToken || req.cookies.refreshToken

    if (!refreshToken) {
        return res.json({ error: 'No refresh token provided' })
    }

    try {
        let payload = jwt.verify(refreshToken, JWT_SECRET)
        payload = {
            id: payload.id,
            userName: payload.userName
        }

        let token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
        let newRefreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })

        setAuthCookies(res, token, newRefreshToken)

        res.json({ token, refreshToken: newRefreshToken })
    } catch (error) {
        return res.json({ error: error.toString() })
    }
}

const logout = async (req, res) => {
    try {
        const opts = getCookieOptions()
        res.clearCookie('token', opts)
        res.clearCookie('refreshToken', opts)
        res.status(200)
        res.json({ message: 'Logout successful' })
    } catch (error) {
        res.status(500)
        res.json(error)
    }
}

const me = (req, res) => {
    const tryRefresh = () => {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        try {
            let payload = jwt.verify(refreshToken, JWT_SECRET)
            payload = { id: payload.id, userName: payload.userName }
            const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
            const newRefreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
            setAuthCookies(res, newToken, newRefreshToken)
            return res.json(payload)
        } catch {
            return res.status(401).json({ error: 'Unauthorized' })
        }
    }

    try {
        const token = req.cookies.token
        if (!token) {
            return tryRefresh()
        }
        try {
            const payload = jwt.verify(token, JWT_SECRET)
            return res.json(payload)
        } catch {
            return tryRefresh()
        }
    } catch {
        res.status(401)
        res.json({ error: 'Unauthorized' })
    }
}

module.exports = {
    register,
    login,
    refresh,
    logout,
    me
}