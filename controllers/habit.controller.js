const {Habit} = require('../models/Habit.model')
const { calculateStreak } = require('../utils/calculateStreak')


//CRUD Controllers
const getAllHabits = (req, res) => {
    const { localDate } = req.query
    Habit.find({ userId: req.user.id })
        .then(allHabits => {
            if (!allHabits) {
                return res.status(404).json({ message: 'No habits found' })
            } else {
                const habitWithStats = allHabits.map(habit => {
                    const stats = calculateStreak(habit.completedDates, habit.frequency, localDate)
                    return {
                        ...habit._doc,
                        stats
                    }
                })
                res.json(habitWithStats)
            }
        })
        .catch(err => res.status(400).json(err))
}

const getOneHabit = (req, res) => {
    const { localDate } = req.query
    Habit.findOne({ _id: req.params.id, userId: req.user.id })
        .then(oneHabit => {
            if (!oneHabit) {
                return res.status(404).json({ message: 'Habit not found' })
            }
            const stats = calculateStreak(oneHabit.completedDates, oneHabit.frequency, localDate)
            res.json({ ...oneHabit.toObject(), stats })
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

const createHabit = (req, res) => {
    const { title, frequency } = req.body
    const { localDate } = req.body
    Habit.create({
        userId: req.user.id,
        title,
        frequency
    })
        .then(newHabit => {
            const stats = calculateStreak(newHabit.completedDates, newHabit.frequency, localDate)
            res.json({ ...newHabit.toObject(), stats })
        })
        .catch(err => res.status(400).json(err))
}

const updateHabit = (req, res) => {
    const { id } = req.params
    const { localDate } = req.body
    Habit.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        req.body,
        { returnDocument: 'after', runValidators: true }
    )
        .then(updatedHabit => {
            if (!updatedHabit) {
                return res.status(404).json({ message: 'Habit not found' })
            }
            const stats = calculateStreak(updatedHabit.completedDates, updatedHabit.frequency, localDate)
            res.json({ ...updatedHabit.toObject(), stats })
        })
        .catch(err => res.status(400).json(err))
}

const deleteHabit = (req, res) => {
    const { id } = req.params
    Habit.deleteOne({ _id: id, userId: req.user.id })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Habit not found' })
            }
            res.json({ message: 'Habit deleted' })
        })
        .catch(err => res.status(400).json(err))
}

//Custom Controllers

const checkHabit = async (req, res) => {
    try {
        const { id } = req.params
        
        const { localDate } = req.body
        const userId = req.user.id

        const habit = await Habit.findOne({ _id: id, userId })

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' })
        }

        const exists = habit.completedDates.includes(localDate)

        if (exists) {
            habit.completedDates = habit.completedDates.filter(date => date !== localDate)
        } else {
            habit.completedDates.push(localDate)
        }
        
        await habit.save()

        const stats = calculateStreak(habit.completedDates, habit.frequency, localDate)

        res.json({...habit.toObject(), stats: stats})

    } catch (err) {
        res.status(400).json(err)
    }
    
}

module.exports = {
    getAllHabits,
    getOneHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    checkHabit
}