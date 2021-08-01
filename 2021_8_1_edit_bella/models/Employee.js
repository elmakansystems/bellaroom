const mongoose = require('mongoose')
const date_format = require('dateformat')
const employeeSchema = mongoose.Schema({
    name: String,
    phone: String,
    location: String,
    date: String,
    n_id: String,
    salary: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    comment: String,
    reg_date: {
        type: String,
        default: date_format(Date.now(), "dddd, mmmm dS, yyyy, h:MM:ss TT")
    }
})
module.exports = mongoose.model('Employee', employeeSchema)