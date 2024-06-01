const express = require('express')
const tourController = require('../controllers/tourController')
const bookingController = require('../controllers/bookingController')
const router = express.Router()
const authController = require('../controllers/authController')
router.use(authController.protect)
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)
router.use(authController.restrict('admin', 'lead-guide'))
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking)
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateBooking)
module.exports = router
