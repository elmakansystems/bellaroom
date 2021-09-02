const mongoose = require('mongoose')

const change_schema = mongoose.Schema({
    id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'invoice'
    },
    payment_change:{
        type : Number,
        default:0
    },
    payment_paid :{
        type:Number,
        default :0
    },
    serial: {
        type :Number ,
        default :0
    },
    date_added: {
        type: Date,
        default: new Date(Date.now())
    }
})

module.exports = mongoose.model('Change', change_schema)