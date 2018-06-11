var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  userName: String,
  pwd: String,
  account:String,
  email: String,
  mobile: String,
  randomNum: String,
  copyrights:[new mongoose.Schema({
    _id: false,
    copyrightId:String,
    workName: String,
    resourcesIpfsHash:String,
    resourcesIpfsDHash:String,
    localUrl:String,
    copyrightAddress:String,
    resourceAddress:String,
  })],
  purchasedResources:[new mongoose.Schema({
    _id: false,
    resourceId:String,
    resourceName: String,
    transactionAddress:String,
    type:String,
    tokenId:String,
    sellStatus:Number,
    sellPrice:String,
    rentOutStatus:Number,
    rentPrice:String
  })],
  rentResources:[new mongoose.Schema({
    _id: false,
    resourceId:String,
    resourceName:String,
    transactionAddress:String,
    type:String,
    tokenId:String,
    rentTime:Number
  })],
  createDate: {type: Date, default: Date.now},
  createBy: String,
  updateDate: {type: Date, default: Date.now},
  updateBy: String
}, {versionKey: false});

var User = mongoose.model("user", userSchema, "user");

module.exports = User;

