const mongoose = require("mongoose");

const inv_supplier_schema = mongoose.Schema({
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "supplier",
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "buyproduct" }],
  total_price: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Number,
    default: 0,
  },
  date_added: {
    type: Date,
    default: new Date(Date.now()),
  },
});
module.exports = mongoose.model("inv_supplier", inv_supplier_schema);
