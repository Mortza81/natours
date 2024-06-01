process.on('uncaughtException', (err) => {
  console.log(err)
  console.log('uncaughtException...shutting dowm...')
  process.exit(1)
})
process.on('warning',e=> console.log(e.stack))
const app = require('./app')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config()
mongoose.connect(process.env.DATABASE_URL).then((con) => {
  console.log("let's go")
})
const server = app.listen(process.env.PORT, () => {
  console.log(`the app is running on port : ${process.env.PORT}`)
})
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
  console.log('unhandledRejection...shutting dowm...')
  server.close(() => {
    process.exit(1)
  })
})
