const mongoose=require('mongoose')
const bookingSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'booking must belongs to a user']
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'booking must belongs to a tour']
    },
    price:{
        type:Number,
        required:[true,'booking must have a price']
    },
    paid:{
        default:true,
        type:Boolean
    }
})
bookingSchema.pre(/^find/,function(next){
    this.populate('user').populate({
        path:'tour',
        select:'name'
    })
    next()
})
const Booking=mongoose.model('Booking',bookingSchema)
module.exports=Booking