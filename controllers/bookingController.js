const User = require('../models/userModel')
const factory=require('./handlerFactory')
const dotenv = require('dotenv')
const catchAsync = require('../utils/catchAsync')
const Booking = require('../models/bookingModel')
dotenv.config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const appError = require('../utils/appErrors')


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) گرفتن تور رزرو شده
  const tour = await Tour.findById(req.params.tourId)

  // 2) ایجاد جلسه پرداخت
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    mode: 'payment', // افزودن پارامتر mode
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  })
  // 3) ارسال جلسه به عنوان پاسخ
  res.status(200).json({
    status: 'success',
    session,
  })
})
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { user, tour, price } = req.query
  if(!user && !tour && !price ) return next()
  await Booking.create({user,tour,price})
  res.redirect(`${req.protocol}://${req.get('host')}`)
})
exports.createBooking=factory.createOne(Booking)
exports.updateBooking=factory.updateOne(Booking)
exports.deleteBooking=factory.deleteOne(Booking)
exports.getAllBooking=factory.getAll(Booking)
exports.getOneBooking=factory.getOne(Booking)