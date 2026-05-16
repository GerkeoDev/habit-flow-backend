const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'The user needs an user name'],
        minlength: [3, 'The user name must be at least 3 charactes long']
    },
    email: {
        type: String,
        required: [true, 'The user needs an email address']
    },
    password: {
        type: String,
        required: [true, 'The user needs a password'],
        minlength: [8, 'The password must be at least 8 characters long']
    }
}, {timestamps: true})

module.exports.User = mongoose.model('User', UserSchema)