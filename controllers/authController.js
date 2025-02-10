const User = require('../models/userModel')
const crypto = require('crypto')
const { promisify } = require('util')
const appError = require('../utils/appErrors')
const catchAsync = require('../utils/catchAsync')
const Email=require('../utils/email')
const jwt = require('jsonwebtoken')
const createAndSendToken = (user, statusCode, res) => {
  const token = signjwt(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  // Remove password from output
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}
const signjwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  })
}
exports.protect = catchAsync(async (req, res, next) => {
  // 1)checking if token exists
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) {
    return next(
      new appError('You are not logged in! Please log in to get access.', 401),
    )
  }
  // 2)verifying
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  // we could just stop here but it's not safe
  // 3)check if user still exists
  // we might delete the user in between login and accessing
  const user = await User.findById(decoded.id)
  if (!user) {
    return next(new appError('your acount has been deleted', 401))
  }
  // 4)check that if user changed it's password or not
  if (user.changedPasswordAfter(decoded.iat)) {
    next(
      new appError(
        'you recently changed your password.please login again!',
        401,
      ),
    )
  }
  res.locals.user = user;
  req.user = user
  next()
})
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   // 1)checking if token exists

//   if (req.cookies.jwt) {
//     // 2)verifying
//     const decoded = await promisify(jwt.verify)(
//       req.cookies.jwt,
//       process.env.JWT_SECRET
//     );
//     // we could just stop here but it's not safe
//     // 3)check if user still exists
//     // we might delete the user in between login and accessing
//     const user = await User.findById(decoded.id)
//     if (!user) {
//       next()
//     }
//     // 4)check that if user changed it's password or not
//     if (user.changedPasswordAfter(decoded.iat)) {
//       next()
//     }
//     res.locals.user = user
//     return next()
//   }
//   next()
// })
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.signup = catchAsync(async (req, res, next) => {
  const url = `${req.protocol}://${req.get('host')}/me`;
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })
  await new Email(newUser,url).sendWelcome()
  createAndSendToken(newUser, 201, res)
  
})
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new appError('Please provide email and password!', 404))
  }
  // behtare user nadoone kodoom ro eshtebah zade
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password', 401))
  }

  createAndSendToken(user, 200, res)
})
exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError("you don't have premission to this rout", 401))
    }
    next()
  }
}
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1)get user by email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new appError('there is no user with this email', 401))
  }
  // 2)produce an reset token
  const resetToken = user.createResetTokenPassword()
  await user.save({ validateBeforeSave: false })
  // 3)send that to email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  
  try {
    // await email({
    //   email: user.email,
    //   subject: 'Your reset Token(valid for 10 minutes)',
    //   message,
    // })
    await new Email(user,resetURL).sendPasswordReset()
    res.status(200).json({
      status: 'success',
      message: 'token sent to your email',
    })
  } catch (err) {
    user.passwordResetTokenExpires = undefined
    user.passwordResetToken = undefined
    await user.save({ validateBeforeSave: false })
    console.log(err);
    return next(new appError('there was a problem sending the email', 500))
  }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  })
  // 2)if user exist update the password
  if (!user) {
    return next(new appError('invalid or exired token', 400))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetTokenExpires = undefined
  await user.save()
  // 3)login
  createAndSendToken(user, 200, res)
})
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError('wrong password', 400))
  }
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  createAndSendToken(user, 200, res)
})
exports.logout=async (req,res,next)=>{
  res.cookie('jwt','logged out',{
    expires:new Date(Date.now()+10*1000),
    httpOnly:true
  })
  res.status(200).json({
    status:"success"
  })
}