const mongoose = require("mongoose");

const buy_product_schema = mongoose.Schema({
  p_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  price: {
    type: Number,
    default: 0,
  },
  inv_p_count: {
    type: Number,
    default: 1,
  },
  date_added: {
    type: Date,
    default: new Date(Date.now()),
  },
});
module.exports = mongoose.model("buyProduct", buy_product_schema);