var mongoose = require("mongoose");
var resourceInfoSchema = new mongoose.Schema({
  resourceName:String,
  desc:String,
  total:Number,
  coverImage:String,
  price:String,
  copyrightId:String,
  copyrightAddress:String,
  resourceAddress: String,
  authorAccount:String,
  hasSellOut:Number,
  sellResources:[ new mongoose.Schema({
    _id: false,
    tokenId:String,
    ownerId:String,
    ownerAccount:String,
    sellPrice:String,
    transactionAddress:String,
  })],
  tenantableResources:[new mongoose.Schema({
    _id: false,
    tokenId:String,
    ownerId:String,
    ownerAccount:String,
    rentPrice:String,
    rentTime:Number,
    transactionAddress:String
  })],
  createDate: {type: Date, default: Date.now},
  createBy: String,
  updateDate: {type: Date, default: Date.now},
  updateBy: String
}, {versionKey: false});

var ResourceInfo = mongoose.model("resourceInfo", resourceInfoSchema, "resourceInfo");

module.exports = ResourceInfo;

