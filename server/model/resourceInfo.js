var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
var resourceInfoSchema = new mongoose.Schema({
  resourceName:String,
  desc:String,
  total:Number,
  coverImage:String,
  price:String,
  copyrightAddress:String,
  resourceAddress: String,
  authorAccount:String,
  hasSellOut:Number,
  purchasedResources:[ new mongoose.Schema({
    _id: false,
    tokenId:String,
    ownerAccount:String,
    purchasePrice:String
  })],
  tenantableResources:[new mongoose.Schema({
    _id: false,
    tokenId:String,
    ownerAccount:String,
    rentPrice:String,
    rentTime:Number,
  })],
  createDate: {type: Date, default: Date.now},
  createBy: String,
  updateDate: {type: Date, default: Date.now},
  updateBy: String
}, {versionKey: false});

var ResourceInfo = mongoose.model("resourceInfo", resourceInfoSchema, "resourceInfo");

module.exports = ResourceInfo;

