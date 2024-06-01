const appError = require('../utils/appErrors')
function errorproduction(err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }
    console.log(err);
    return res.status(err.statusCode).json({
      status: 'error',
      message: 'somthing went wrong!',
    })
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error',{
      message:err.message,
      title:'error'
    })
  }
  // console.log(err);
  return res.status(err.statusCode).render('error',{
    title:'error',
    message:'Please try again later'
  })
  
  

}
function errordevelopment(err, req, res) {
  // for api
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      message: err.message,
      stack: err.stack,
      error: err,
    })
  }
  // for rendered website
  else {
    console.log(err);
    res.status(err.statusCode).render('error', {
      title: 'error',
      message: err.message,
    })
  }
}
function handleCastError(err) {
  return new appError(`invalid ${err.path}: ${err.value}`, 404)
}
function handleDuplicateError(err) {
  const value = err.message.match(/"(.*?)"/)[1]
  return new appError(
    `duplicated field, value: ${value}, use another value`,
    400,
  )
}
function handleValidationError(err) {
  let errorsString = ''
  Object.values(err.errors).forEach((el) => {
    errorsString += `.${el.message}`
  })
  return new appError(`invalid input data: ${errorsString}`, 400)
}
const hendleJWTError = () => new appError('invalid token!.please login.', 401)
const handleJWTExpiredError = () =>
  new appError('your token has expired.please login again.', 401)
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV == 'development') {
    errordevelopment(err, req, res)
  } else if (process.env.NODE_ENV == 'production') {
    if (err.name == 'CastError') {
      err = handleCastError(err)
    }
    if (err.code == 11000) {
      err = handleDuplicateError(err)
    }
    if (err.name == 'ValidationError') {
      err = handleValidationError(err)
    }
    if (err.name == 'JsonWebTokenError') {
      err = hendleJWTError()
    }
    if (err.name == 'TokenExpiredError') {
      err = handleJWTExpiredError()
    }
    errorproduction(err, req, res)
  }
}
