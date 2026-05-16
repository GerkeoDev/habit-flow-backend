require('dotenv').config()
require('./config/mongoose.config')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const { CLIENT_URL, PORT } = process.env


app.use(cors({credentials: true, origin: CLIENT_URL}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

const { oAuthRouter } = require('./routes/oauth.routes')
app.use('/api/', oAuthRouter)

const { habitRouter } = require('./routes/habit.routes')
app.use('/api/', habitRouter)

app.listen(PORT, ()=> console.log(`Listening on port: ${PORT} \nDate: ${new Date().toString()}`))