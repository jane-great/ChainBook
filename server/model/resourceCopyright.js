var mongoose = require("mongoose");
var ResourceCopyrightSchema = new mongoose.Schema({
  workName:String,
  workCategory:String,
  copyrightAddress:String,
  resourceAddress:String,
  resourceHash:String,
  resourceDHash:String,
  account:String,
  localUrl:String,
  author:[new mongoose.Schema({
    _id: false,
    authorName:String,
    identityType:Number,
    identityNum:String
  })],
  workProperty:String,
  rights:[String],
  belong:String,
  auditStatus:Number,
  publishStatus:Number,
  createDate: {type: Date, default: Date.now},
  createBy: String,
  updateDate: {type: Date, default: Date.now},
  updateBy: String
}, {versionKey: false});

var ResourceCopyright = mongoose.model("resourceCopyright", ResourceCopyrightSchema, "resourceCopyright");

module.exports = ResourceCopyright;
