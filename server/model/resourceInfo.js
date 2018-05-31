var mongoose = require("mongoose");
var resourceInfoSchema = new mongoose.Schema({
  resourceName:String,
  desc:String,
  limit:Number,
  coverImage:String,
  price:String,
  copyrightAddress:String,
  resourceAddress: String,
  authorAccount:String,
  hasSellOut:Number,
  createDate: {type: Date, default: Date.now},
  createBy: String,
  updateDate: {type: Date, default: Date.now},
  updateBy: String
}, {versionKey: false});

var ResourceInfo = mongoose.model("resourceInfo", resourceInfoSchema, "resourceInfo");

module.exports = ResourceInfo;

