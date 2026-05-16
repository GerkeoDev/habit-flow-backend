const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to the database\n----------------------------------------------------------------'))
    .catch(err => console.log('Error connecting to the database', err))