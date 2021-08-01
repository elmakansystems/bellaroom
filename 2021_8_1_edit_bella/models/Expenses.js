const mongoose = require('mongoose')
const expenses_schema = mongoose.Schema({
    text: String,
    amount: Number,
    serial: Number,
    date_added: {
        type: Date,
        default: new Date(Date.now())
    }
})
module.exports = mongoose.model('Expenses', expenses_schema)