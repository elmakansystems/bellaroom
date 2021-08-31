const mongoose = require("mongoose");
const addition_schema = mongoose.Schema({
  text: String,
  amount: Number,
  serial: Number,
  date_added: {
    type: Date,
    default: new Date(Date.now()),
  },
});
module.exports = mongoose.model("Addition", addition_schema);
