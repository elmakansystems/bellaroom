const mongoose = require('mongoose')

const add_sub_schema = mongoose.Schema({ name: String, value: String })

const ebill_schema = mongoose.Schema({
    name: String,
    total: Number,
    _add: Number,
    _sub: Number,
    total: Number,
    add: [add_sub_schema],
    sub: [add_sub_schema],
    emp_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    dateAdded: String,
    monthReg: String,
    yearReg: String,
    timeReg: String,
    isMod: false,
    dateMod: {
        type: String,
        default: this.timeReg
    },
    date: {
        type: Date,
        default: Date.now()
    }
})
module.exports = mongoose.model('EBill', ebill_schema)