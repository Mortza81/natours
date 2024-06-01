const express = require('express')
const tourController = require('../controllers/tourController')
const reviewController = require('../controllers/reviewController')
const router = express.Router()
const authController = require('../controllers/authController')

router.use('/:tourId/reviews', require('../routes/reviewRouter'))
router.param('id', tourController.checkTour)
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.createTour,
  )
router.route('/tour-stat').get(tourController.getTourStat)
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  )
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)
router
  .route('/top-5-cheap')
  .get(tourController.alias, tourController.getAllTours)
router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour,
  )
module.exports = router
