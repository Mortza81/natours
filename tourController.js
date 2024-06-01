const fs = require('fs')
const Tour = require('../models/tourModel')
const { json } = require('express')
const factory=require('./handlerFactory')
const APIFeatures = require('../utils/APIFeatures')
const { match } = require('assert')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appErrors')
exports.checkTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
  if (!tour) {
    return next(new appError('no tour with this ID', 404))
  }
  next()
})
exports.getAllTours = factory.getAll(Tour)
exports.getTourStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        // در خط بالا باید فیلدی را بدهیم که میخواهیم با آن گروهبندی کنیم
        numRating: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
      // 1 means asc
    },
  ])
  res.status(200).json({
    status: 'succsess',
    data: stats,
  })
})
exports.alias = (req, res, next) => {
  req.query.limit = 5
  req.query.sort = 'price,ratingsAverage'
  next()
}
exports.createTour = factory.createOne(Tour)
// 
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${req.params.year * 1}-01-01`),
          $lte: new Date(`${req.params.year * 1}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ])
  res.status(200).json({
    status: 'succsess',
    plan,
  })
})
exports.getOneTour = factory.getOne(Tour,{path:'reviews'})
