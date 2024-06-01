const dotenv = require('dotenv')
const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Review = require('../models/reviewModel')
const mongoose = require('mongoose')
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'))
const data1 = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'))
const data2 = JSON.parse(fs.readFileSync('./users.json', 'utf-8'))
dotenv.config()
mongoose.connect("mongodb://127.0.0.1:27017/natours").then((con) => {
  console.log("let's go")
})
const deletedata = async () => {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('successful')
  } catch (error) {
    console.log(error)
  }
  process.exit()
}
const createdata = async () => {
  try {
    await Tour.create(data)
    await Review.create(data1)
    await User.create(data2,{validateBeforeSave:false})
    console.log('successful')
  } catch (error) {
    console.log(error)
  }
  process.exit()
}
if (process.argv[2] == '--delete') {
  deletedata()
} else if (process.argv[2] == '--import') {
  createdata()
}
