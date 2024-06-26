const User = require('../models/userModel')
const sharp = require('sharp')
const multer = require('multer')
const appError = require('../utils/appErrors')
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   },
// })
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
exports.resizeUserPhoto =catchAsync(async (req, res, next) => {
  if (!req.file) return next()
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)
    next()
})
exports.uploadUserPhoto = upload.single('photo')
exports.checkUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new appError('no user with this ID', 404))
  }
  next()
})
exports.getme = (req, res, next) => {
  req.params.id = req.user.id
  next()
}
const filterObj = (obj, ...allowedFields) => {
  let newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    isActive: false,
  })
  res.status(204).json({
    status: 'success',
    data: null,
  })
})
exports.updateMe = catchAsync(async (req, res, next) => {

  // 1)user shuold not send the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('this route is not for changing password', 400))
  }
  const objFiltered = filterObj(req.body, 'email', 'name')
  objFiltered.photo = req.file.filename
  const user = await User.findByIdAndUpdate(req.user.id, objFiltered, {
    runValidators: true,
    new: true,
  })
  res.status(200).json({
    status: 'success',
    user,
  })
})
exports.getAllUsers = factory.getAll(User)
exports.getOneUser = factory.getOne(User)
// exports.createUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'this route is not yet defined!',
//   })
// }
exports.deleteUser = factory.deleteOne(User)
// the below route is for admin use
// do not update password with this, cause pre save middlewares not going to work
exports.updateUser = factory.updateOne(User)
