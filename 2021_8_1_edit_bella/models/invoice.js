const mongoose = require('mongoose')

const invoice_schema = mongoose.Schema({

    invId: String,
    name: String,
    phone: String,
    location: String,
    comment: String,
    receive: String,
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dealer'
    },
    inv_products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InvProduct' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    total_discount: {
        type: Number,
        default: 0
    },
    total_price: {
        type: Number,
        default: 0
    },
    total_percentage: {
        type: Number,
        default: 0
    },
    total_total: {
        type: Number,
        default: 0
    },
    paid: {
        type: Number,
        default: 0
    },
    change: {
        type: Number,
        default: 0
    },
    date_added: {
        type: Date,
        default: new Date(Date.now())
    }
})

module.exports = mongoose.model('Invoice', invoice_schema)