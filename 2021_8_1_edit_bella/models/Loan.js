const mongoose = require('mongoose')
const loan_schema = mongoose.Schema({
    amount: Number,
    name: String,
    change: Number,
    add: {
        type: [Number],
        default: [0]
    },
    sub: {
        type: [Number],
        default: [0]
    },
    id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    ref: String,
    date_added: {
        type: Date,
        default: new Date(Date.now())
    }
})
module.exports = mongoose.model('Loan', loan_schema)