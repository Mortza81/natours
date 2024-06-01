const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')
const router = express.Router({mergeParams:true})
router.use(authController.protect)
router.param('id', reviewController.checkReview)
router
  .route('/')
  .post(authController.restrict('user'),reviewController.setUserIdAndTourId,reviewController.checkCreateReview,reviewController.createReview)
  .get(reviewController.getAllReviews)
router
  .route('/:id')
  .get(reviewController.getOneReview)
  .delete(authController.restrict('user','admin'),reviewController.deleteReview)
  .patch(authController.restrict('user','admin'),reviewController.updateReview)
module.exports = router
