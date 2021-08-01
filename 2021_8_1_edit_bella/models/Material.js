const mongoose = require('mongoose')
const material_schema = mongoose.Schema({
    name: String,
    dealer: String,
    phone: String,
    unit: Number,
    total: Number,
    date_added: {
        type: Date,
        default: new Date(Date.now())
    }
})
module.exports = mongoose.model('Material', material_schema)