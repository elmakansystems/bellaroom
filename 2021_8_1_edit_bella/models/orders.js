const mongoose = require('mongoose')
const date_format = require('dateformat')

const orders_schema = mongoose.Schema({
    name: { type: String, default: 'default txt' },
    desc: { type: String, default: 'default txt' },
    quantity: { type: String, default: 'default txt' },
})



const custom_order_schema = mongoose.Schema({
    name: { type: String },
    phone: { type: String },
    location: { type: String },
    date: { type: String },
    deliver: { type: String },
    comments: { type: String },
    orders: [orders_schema],
    dateAdded: {
        type: String,
        default: date_format(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT")
    },
})
module.exports = mongoose.model('Order', custom_order_schema)