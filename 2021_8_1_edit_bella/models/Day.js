const mongoose = require('mongoose')
const day_schema = mongoose.Schema({
    at: String,
    dateReg: {
        type: Date,
        default: new Date(Date.now())
    },
    attends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attend'
    }]

})
module.exports = mongoose.model('Day', day_schema)