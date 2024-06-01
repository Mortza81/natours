const Review = require('../models/reviewModel')
const Booking=require('../models/bookingModel')
const User=require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const appError=require('../utils/appErrors')
const factory=require('./handlerFactory')
const Tour = require('../models/tourModel')
exports.checkReview=catchAsync(async (req,res,next)=>{
    const review=await Review.findById(req.params.id)
    if(!review){
        return next(new appError('no review with this ID',404))
    }
    next()
})
exports.getAllReviews = factory.getAll(Review)
exports.getOneReview=factory.getOne(Review)
exports.setUserIdAndTourId=catchAsync(async (req,res,next)=>{
    if(!req.body.user) req.body.user=req.user.id
    if(!req.body.tour) req.body.tour=req.params.tourId
    next()
})
exports.checkCreateReview=catchAsync(async (req,res,next)=>{
    const bookings=await Booking.find({user:req.body.user})
    // console.log(bookings[0].tour.id);
    const tourIDs=bookings.map(el=>el.tour.id)
    if(!tourIDs.includes(req.body.tour)){
        return next(new appError("you didn't booked this tour"))
    }
    next()
})
exports.deleteReview=factory.deleteOne(Review)
exports.createReview=factory.createOne(Review)
exports.updateReview=factory.updateOne(Review)