var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  userName: String,
  pwd: String,
  account:String,
  email: String,
  mobile: String,
  copyright:[{
    _id: false,
    workName: String,
    resourcesIpfsHash:String,
    resourcesIpfsDHash:String,
    localUrl:String,
    copyrightAddress:String,
    resourcesAddress:String,
  }],
  purchasedResources:[{
    _id: false,
    resourceName: String,
    type:String,
    tokenId:String,
    sellStatus:Number,
    sellPrice:String,
    rentOutStatus:Number,
    rentPrice:String
  }],
  rentResources:[{
    _id: false,
    resourceName:String,
    type:String,
    tokenId:String,
    rentTime:Number
  }],
  createDate: {type: Date, default: Date.now},
  createBy: String,
  updateDate: {type: Date, default: Date.now},
  updateBy: String
}, {versionKey: false});

var User = mongoose.model("user", userSchema, "user");

module.exports = User;

