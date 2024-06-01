const fs = require('fs')
const Tour = require('../models/tourModel')
const sharp = require('sharp')
const multer = require('multer')
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
const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0].startsWith('image')) {
    cb(null, true)
  } else {
    cb(new appError('Not an image! Please upload only images.', 400), false)
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})
exports.uploadTourImages=upload.fields(
  [
    {name:'imageCover', maxCount:1},
    {name:'images', maxCount:3}
  ]
)
exports.resizeTourImages =catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images ) return next()
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)
  req.body.images=[]
  await Promise.all(req.files.images.map(async (file,index)=>{
    const filename=`tour-${req.params.id}-${Date.now()}-${index+1}.jpeg`
    await sharp(file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${filename}`)
    req.body.images.push(filename)
  }))
  
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
exports.updateTour = factory.updateOne(Tour,true)
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
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new appError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

exports.getOneTour = factory.getOne(Tour,{path:'reviews'})
