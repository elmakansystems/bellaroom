const mongoose = require('mongoose')


// يستخدم هذا الموديل من فاتورة البيع
const supplier_schema = mongoose.Schema({
    name: {
        type: String,
        default: "supplier"
    },
    address: {
        type: String,
        default: "supplier"
    },
    phone: {
        type: Number,
        default: 0
    },
    total_price: {
        type: Number,
        default: 0
    },
    total_paid: {
        type: Number,
        default: 0
    },
    date_added: {
        type: Date,
        default: new Date(Date.now())
    },
})
module.exports = mongoose.model('supplier', supplier_schema)