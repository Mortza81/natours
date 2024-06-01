const catchAsync = require('../utils/catchAsync')
const Tour=require('../models/tourModel')
const appError = require('../utils/appErrors')
const Booking = require('../models/bookingModel')
exports.getOverview = catchAsync(async (req, res, next) => {
    const tours=await Tour.find()
  res.status(200).render('overview', {
    title: 'Home',
    tours
  })
})
exports.getTour = catchAsync(async (req, res, next) => {
  let bookings
  const tour=await Tour.findOne({slug:req.params.slug}).populate('reviews')
  bookings=await Booking.find({tour:tour.id})
  if(!tour){
    return next(new appError('there is no tour with that name',400))
  }
  console.log(bookings);
  res.status(200).render('tour',{
    title:tour.name,
    tour,
   bookings
  })
})
exports.login=catchAsync(async (req,res,next)=>{
  res.status(200).render('login',{
    title:'Login'
  })
})
exports.getAccount=catchAsync(async (req,res,next)=>{
  res.status(200).render('account',{
    title:'dashboard'
  })
})
exports.signup=(req,res,next)=>{
  res.status(200).render('signup',{
    title:'signup'
  })
}
exports.getMyTours=catchAsync(async (req,res,next)=>{
  const bookings=await Booking.find({user:req.user.id})
  const tourIDs=bookings.map(el=> el.tour.id)
  const tours=await Tour.find({_id:{$in:tourIDs}})
  res.status(200).render('overview',{
    title:'My Tours',
    tours
  })
})

