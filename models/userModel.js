const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const validator = require('validator')
const userSchema = new mongoose.Schema({
  name: {
    required: [true, 'name is requied'],
    type: String,
  },
  photo: {
    type: String,
    default:'default.jpg'
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'your email is not valid'],
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: [8, 'your password should have more than 8 characters'],
    select: false,
    // it will never be visible to the clients
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password
      },
      message: 'your password and your passwordconfirm are not match',
    },
  },
  changedPasswordAt: Date,
  role: {
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    type: String,
    default: 'user',
  },
  isActive:{
    type:Boolean,
    default:true,
    select:false
  },
  passwordResetToken:String,
  passwordResetTokenExpires:Date
})
userSchema.methods.correctPassword = async function (
  orgPassword,
  hashedPassword,
) {
  return await bcrypt.compare(orgPassword, hashedPassword)
}
userSchema.methods.changedPasswordAfter = function (jwtiat) {
  if (this.changedPasswordAt) {
    const passwordChanged = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10,
    )
    return passwordChanged > jwtiat
  }
  return false
}
// this one and the one below it will not work with findByIdAndUpdate
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
  } else {
    next()
  }
})
userSchema.pre('save',function(next){
  if(!this.isModified('password') || this.isNew) return next()
  this.changedPasswordAt=Date.now()
  next()
})
userSchema.methods.createResetTokenPassword = function () {
  const resetToken = crypto.randomBytes(12).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    this.passwordResetTokenExpires=Date.now() + 10 *1000*60
    return resetToken
}
userSchema.pre(/^find/,function(next){
  this.find({isActive:{$ne:false}})
  next()
})
const User = mongoose.model('User', userSchema)
module.exports = User
