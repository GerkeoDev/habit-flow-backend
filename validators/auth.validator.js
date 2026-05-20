const validateRegister = (data) => {
    const errors = {}
    //Name
    if(data.userName.length < 3){
        errors.userName = 'User name must be at least 3 characters long'
    }
    if(data.userName.length > 20){
        errors.userName = 'User name must be less than 20 characters long'
    }
    if(data.userName.includes(' ')){
        errors.userName = 'User name cannot contain spaces'
    }
    //Email
    if(data.email.includes(' ')){
        errors.email = 'Email cannot contain spaces'
    }
    if(!data.email.includes('@') || !data.email.includes('.')){
        errors.email = 'Invalid email address'
    }
    if(data.email.length > 50){
        errors.email = 'Email must be less than 50 characters long'
    }
    if(data.email.length < 5){
        errors.email = 'Email must be at least 5 characters long'
    }
    //Password
    if(data.password.length > 50){
        errors.password = 'Password must be less than 50 characters long'
    }
    if(data.password.length < 8){
        errors.password = 'Password must be at least 8 characters long'
    }

    return errors
}

const validateLogin = (data) => {
    const errors = {}
    //Email and Password
    if (!data.email || !data.password) {
        errors.message = 'Missing required fields'
    }

    return errors
}




module.exports = {
    validateRegister,
    validateLogin
}