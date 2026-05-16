

const calculateStreak = (completedDates, frequency, localDate) => {
    if (!completedDates.length) {
        return {
            currentStreak: 0,
            bestStreak: 0,
            completedToday: false,
            totalCompletions: 0
        }
    }
    completedDates.sort((a, b) => new Date(b) - new Date(a))
    const step = frequency === 'daily' ? 1 : 7

    const diffInDays = (a, b) => {
        const d1 = new Date(a)
        const d2 = new Date(b)
        return Math.abs((d1 - d2) / (1000 * 60 * 60 * 24))
    }

    const today = localDate
    const completedToday = completedDates.includes(today)



    let currentStreak = 0
    const firstDay = completedDates[0]
    if (
        firstDay === today ||
        diffInDays(firstDay, today) === step
    ) {
        currentStreak = 1

        for (let i = 0; i < completedDates.length - 1; i++) {
            const diff = diffInDays(completedDates[i], completedDates[i + 1])

            if (diff === step) {
                currentStreak++
            } else {
                break
            }
        }
    }
    
    
    
    
    
    let bestStreak = 1
    let tempStreak = 1
    for (let i = 0; i < completedDates.length - 1; i++) {
        const diff = diffInDays(completedDates[i], completedDates[i + 1])

        if (diff === step) {
            tempStreak++
            if (tempStreak > bestStreak) {
                bestStreak = tempStreak
            }
        } else {
            tempStreak = 1
        }
    }
    
    return {
        currentStreak,
        bestStreak,
        completedToday,
        totalCompletions: completedDates.length
    }
}


module.exports = {
    calculateStreak
}