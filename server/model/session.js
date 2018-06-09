var mongoose = require("mongoose");
var sessionsSchema = new mongoose.Schema({
  _id:String,
  session:String,
  expires:{type: Date}
}, {versionKey: false});

var Sessions = mongoose.model("sessions", sessionsSchema, "sessions");

module.exports = Sessions;

