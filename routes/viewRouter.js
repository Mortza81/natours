const express = require('express')
const bookingConroller=require('../controllers/bookingController')
const viewController = require('../controllers/viewController')
const authController=require('../controllers/authController')
const router = express.Router()

router.get('/',bookingConroller.createBookingCheckout,authController.isLoggedIn,viewController.getOverview)
router.get('/tours/:slug',authController.isLoggedIn,viewController.getTour)
router.get('/login',viewController.login)
router.get('/signup',viewController.signup)
router.get('/my-tours',authController.protect,viewController.getMyTours)
router.get('/me',authController.protect,viewController.getAccount)

module.exports=router
