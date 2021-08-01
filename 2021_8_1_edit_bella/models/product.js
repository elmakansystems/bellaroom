const mongoose = require('mongoose')

// هتستخد الموديل دا في صفحة المنتجات

const product_schema = mongoose.Schema({
    name: {
        type: String,
    },
    p_type: {
        type: String,
        default: 'collection'
    },
    dealer: String,
    phone: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },

    date_added: {
        type: Date,
        default: new Date(Date.now())
    },
})
module.exports = mongoose.model('Product', product_schema)