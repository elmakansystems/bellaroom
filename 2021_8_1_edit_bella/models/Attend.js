const mongoose = require("mongoose");
const attend_schema = mongoose.Schema({
  name: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  date_at: String,
  dateAdded: {
    type: Date,
    default: new Date(Date.now()),
  },
  attend: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Attend", attend_schema);
