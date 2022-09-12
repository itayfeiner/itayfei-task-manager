const mongoose = require('mongoose')
const validator = require('validator')  
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    age: {
        type: Number,
        default: 0
    },
    avatar: {
        type: Buffer
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim : true,
        lowercase: true,    
        validate(val){
            if(!(validator.isEmail(val))){
                throw new Error('Email adress is not correct')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(val){  
            if(val.length < 6 || val == 'password'){
                throw new Error('Password is illegal')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', // relationship between user and task
    foreignField: 'owner'

})

userSchema.methods.toJSON = function () { //toJSON conerts to object with stringify
    const user = this
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function() { // using methods for changes for individual user
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => { //using statics for changes for User model
    const user = await User.findOne({email: email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    //console.log('user found')
    return user
}



// hash the plain password before save
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    } else {
        //console.log("password already updated")
    }
    next()
})

// deletes user's tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User