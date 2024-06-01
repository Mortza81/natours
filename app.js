const express = require('express')
const path = require('path')
const rateLimit = require('express-rate-limit')
const compression=require('compression')
const xss = require('xss-clean')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const { default: mongoose, sanitizeFilter } = require('mongoose')
const appError = require('./utils/appErrors')
const globalErrorHandler = require('./controllers/errorController')
const app = express()
const cookieParser=require('cookie-parser')
// فشرده سازی ریسپانس ها
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({limit:'10kb', extended:true}))
// sends cookie along with req
app.use(cookieParser())
// preventing parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
)
// preventing nosql injection
app.use(mongoSanitize())
// preventing inserting html
app.use(xss())
// set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
// app.use(express.static(''))
// limit requests from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  // 1 hour
  message: 'too many request by your IP, you are banned for 1 hour',
})

app.use('/api', limiter)
app.use('/',require('./routes/viewRouter'))
app.use('/api/v1/booking',require('./routes/bookingRouter'))
app.use('/api/v1/reviews', require('./routes/reviewRouter'))
app.use('/api/v1/tours', require('./routes/tourRouter'))
app.use('/api/v1/users', require('./routes/userRouter'))
app.all('*', (req, res, next) => {
  next(new appError(`${req.originalUrl} not found`, 404))
})
app.use(globalErrorHandler)
module.exports = app
