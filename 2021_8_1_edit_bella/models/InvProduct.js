const mongoose = require('mongoose')


// يستخدم هذا الموديل من فاتورة البيع
const inv_product_schema = mongoose.Schema({

    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    // جملة المنتج الفعلي وقت بيعة
    current_price: {
        type: Number,
        default: 5
    },
    inv_warranty: {
        type: Number,
        default: 5
    },
    inv_price: {
        type: Number,
        default: 0
    },
    inv_discount: {
        type: Number,
        default: 0
    },
    inv_percent: {
        type: Number,
        default: 0
    },
    inv_total: {
        type: Number,
        default: 0
    },
    date_added: {
        type: Date,
        default: new Date(Date.now())
    },
})
module.exports = mongoose.model('InvProduct', inv_product_schema)