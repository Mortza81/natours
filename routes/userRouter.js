const express = require('express')
const userController = require('../controllers/userController')
const router = express.Router()
const authController = require('../controllers/authController')
router.param('id', userController.checkUser)
router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
)
router.delete('/deleteMe', authController.protect, userController.deleteMe)
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
)
router.get('/logout', authController.logout)
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.use(authController.protect)

router.route('/me').get(userController.getme, userController.getOneUser)
router.use(authController.restrict('admin'))
router.route('/').get(userController.getAllUsers)
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)
module.exports = router
