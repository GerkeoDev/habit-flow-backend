const {User} = require('../models/User.model')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const register = async (req, res) => {
    let userData = req.body
    try {
        let existUserWithSameEmail = await User.exists({ email: userData.email })
        let existUserWithSameName = await User.exists({ userName: userData.userName })

        const errors = {}

        if (existUserWithSameEmail) {
            errors.email = "The email already exists"
        }

        if (existUserWithSameName) {
            errors.userName = "The user name already exists"
        }

        if (Object.keys(errors).length > 0) {
            return res.status(500).json({ errors })
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
        res.json({user})
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            let errors = {}
            Object.keys(error.errors).map((key) => {
                errors[key] = error.errors[key].message
            })
            res.status(400).json({ errors: errors})
        } else {
            res.status(500).json({ error: error.toString() })
        }
    }
}

const login = async (req, res) => {
    let data = req.body
    try {
        let user = await User.findOne({ email: data.email })

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        let samePassword = await bcrypt.compareSync(data.password, user.password)

        if (samePassword) {
            const payload = {
                id: user._id,
                userName: user.userName
            }

            let token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
            let refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })

            res.cookie('token', token, { httpOnly: true })

            res.json({ user: payload, token, refreshToken })
        } else {
            res.status(400).json({ error: 'Invalid credentials' })
        }
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ error: error.toString() })
        } else {
            res.status(500).json({ error: error.toString() })
        }
    }
}

const refresh = (req, res) => {
    let data = req.body

    if (!data.refreshToken) {
        return res.json({ error: 'No refresh token provided' })
    }

    try {
        let payload = jwt.verify(data.refreshToken, JWT_SECRET)
        payload = {
            id: payload.id,
            userName: payload.userName
        }

        let token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
        let refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })

        res.json({ token, refreshToken })
    } catch (error) {
        return res.json({ error: error.toString() })
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token')
        res.status(200)
        res.json({ message: 'Logout successful' })
    } catch (error) {
        res.status(500)
        res.json(error)
    }
}

const me = (req, res) => {
    try {
        const token = req.cookies.token
        const payload = jwt.verify(token, JWT_SECRET)
        res.json(payload)
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