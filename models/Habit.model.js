const mongoose = require('mongoose')

const HabitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    title: {
        type: String,
        required: [true, 'The habit needs a title'],
        minlenght: [3, 'The title must be at least 3 characters long']
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily'
    },
    completedDates: {
        type: [String],
        default: []
    },
    createdAt: {
        type: [Date],
        default: Date.now
    }
}, {timestamps: true})

module.exports.Habit = mongoose.model('Habit', HabitSchema)