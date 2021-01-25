const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

const userSchema = mongoose.Schema({
    name: {
        type : String,
        require : true,
        trim : true
    },
    password:{
        type : String,
        require:true,
        trim : true,
        validate(value){
            if (value.length < 6) {
                throw new Error('Password length must be more than 6 characters!!')
            } else if (value.includes('password')) {
                throw new Error('Password should not include the word "password!"')
            }
        }
    },
    email:{
        type : String,
        unique:true,
        require : true,
        trim : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valide!')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if (value<0){
                throw new Error('Age is invalide!')
            }
        }
    },
    avatar : {
        type : Buffer
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
},{
    timestamps : true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateToken = async function (){
    const user = this 
    const token = jwt.sign({_id : user._id.toString()} , 'thisismynewcourse')
    user.tokens= user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password)=>{

    const user = await User.findOne({ email })
    
    if (!user) {
        throw new Error('unable to login!')
    }

    const isMatch = await bcrypt.compare( password , user.password )

    if (!isMatch){
        throw new Error('unable to login!')
    }
    return user
}

userSchema.pre('save',async function(next){
    
    const user = this
    if (user.isModified('password')){  //is modified method is used to determine if the user password is changed
        user.password = await bcrypt.hash(user.password , 8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
})

const User = mongoose.model('me',userSchema)

module.exports = User