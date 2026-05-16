const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET


const verifyToken = (req, res, next) => {
    const header = req.header('Authorization') || ''
    let token = header.split(' ')[1]

    if (!token && req.cookies){
        token = req.cookies.token
    }

    if (!token){
        return res.status(401).json({error: 'Token didn\'t send'})
    }
    
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({error: error.toString()})
    }
}

module.exports = {
    verifyToken
}