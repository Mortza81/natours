const mongoose = require('mongoose')
const Tour = require('./tourModel')
const reviewSchema = new mongoose.Schema({
  review: {
    required: [true, 'review should have a text'],
    type: String,
    maxLenght: [500, 'you reached the limit of lenght'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review most belongs to a User'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'review most belongs to a tour'],
  },
})
// with this code each user can only have one review foreach tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})
reviewSchema.statics.calcRating = async function (tourId) {
  // this refers to current Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId, rating: { $exists: true } },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ])
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRatings,
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    })
  }
}
reviewSchema.post('save', async function () {
  this.constructor.calcRating(this.tour)
})
// findByIdAndDelete
// findByIdAndUpdate
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne()
  // console.log(this.r);
  next()
})

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  this.r.constructor.calcRating(this.r.tour)
})
const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
