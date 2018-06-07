var log4js = require('log4js');
var logger = log4js.getLogger('controller/resourceInfo');
var userDao = require("../dao/user");
var resourceInfoDao = require("../dao/resourceInfo");
var resourceCopyrightDao = require("../dao/resourceCopyright");
var resourceContractDao = require("../dao/resourceContract");
const objectUtils = require("../utils/objectUtils");
const localUpload = require("../component/localUpload");

/**
 * 发布资源，post方法
 * @param req
 * @param res
 * @param next
 */
exports.publishResource = async function(req, res, next) {
  let copyrightId = req.body.copyrightId;
  let resourceName = req.body.resourceName;
  let desc = req.body.desc;
  let total = req.body.total;
  let coverImage = req.body.coverImage;
  let price = req.body.price;
  let user = req.session.passport.user.account;
  let authorAccount = user.account;
  try{
    //1、先校验该版权是否具备发行的资格
    let copyright = await resourceCopyrightDao.findOne({_id:id,auditStatus:1});
    if(!copyright){
      res.send({status:0,msg:"该版权目前不具备发行资格"});
      return;
    }
    //2、先将发行的数据登记进数据库中
    let resourceInfo = {
      resourceName:resourceName,
      desc:desc,
      total:total,
      coverImage:coverImage,
      price:price,
      copyrightAddress:copyright.copyrightAddress,
      authorAccount:authorAccount,
      hasSellOut:0,
    }
    await resourceInfoDao.add(resourceInfo);
    //3、创建资源合约
    let result = await resourceContractDao.publishResource(user,resourceInfo);
    //4、登记发行状态、合约地址
    //5、返回结果
    res.send({status:1,msg:"发行成功"});
  }catch (e) {
    logger.error("publish fail",{
      copyrightId:copyrightId,
      resourceName:resourceName,
      desc:desc,
      total:total,
      coverImage:coverImage,
      price:price,
      authorAccount:authorAccount
    },e);
    res.send({status:0,msg:"发行失败,请重发行"});
  }
}

/**
 * 上传封面图片
 * @param req
 * @param res
 * @param next
 */
exports.uploadCoverImg = function(req, res, next) {
  let upload = localUpload.imageUpload.single("coverImage");
  upload(req,res,function(err) {
    if(err){
      logger.error("upload fail",err);
      res.send({status:0,msg:'上传图片失败'});
      return;
    }
    var file = req.file;
    if(!file){
      res.send({status:0,msg:'上传图片失败'});
      return;
    }
    logger.info('file info',{
      mimetype:file.mimetype,
      originalname:file.originalname,
      size:file.size,
      path:file.path });
    res.send({status:1,msg:'success',data:{path:file.path.replace(/\\/g,"/")}});
  });
}

exports.buyFromAuthor = function(req, res, next){

}

/**
 * 购买一个资源
 * @param req
 * @param res
 * @param next
 */
exports.buy = function (req, res, next) {
  logger.info("buy");
  //1、先登记发布的资源基本数据
  res.send("buy");
}

/**
 * 租赁一个资源
 * @param req
 * @param res
 * @param next
 */
exports.rent = function(req, res, next) {
  logger.info("rent");
  //1、先登记发布的资源基本数据
  res.send("rent");
}

/**
 * 根据id获取资源信息细节
 * @param req
 * @param res
 * @param next
 */
exports.getResourceDetailById = async function(req, res, next) {
  let id = req.param("id");
  logger.info("getResourceDetailById",{id:id});
  try{
    objectUtils.notNullAssert(id);
    let resourceInfo = await resourceInfoDao.findSellOutStatusById(id);
    res.send({status:1,msg:"success",data:resourceInfo});
  }catch (e) {
    logger.error("get resource info detail fail.",{
      id:id
    },e);
    res.send({status:0,msg:"get resource info detail fail."});
  }
}

/**
 * 根据分页获取所有可以购买的首发资源
 * @param req
 * @param res
 * @param next
 */
exports.getResourceListByPage = async function(req, res, next) {
  let page = req.body.page;
  try{
    page = validatePage(page);
    let resourceInfoList = await resourceInfoDao.findAllResource(page);
    let total = await resourceInfoDao.count({hasSellOut:0});
    if(resourceInfoList !== undefined && resourceInfoList.length > 0 ){
      page.lastId = resourceInfoList[resourceInfoList.length -1]._id;
    }
    let data = {
      total:total,
      resourceInfoList: resourceInfoList,
      page: page
    }
    res.send({status:1,msg:"success",data:data});
  }catch (e) {
    logger.error("get resource list fail.",{
      page:page
    },e);
    res.send({status:0,msg:"get resource list fail."+e.message});
  }
}

exports.getPurchasedResourceListByPage = async function(req, res, next) {
  let page = req.body.page;
  try{
    page = validatePage(page);
    let resourceInfoList = await resourceInfoDao.findPurchasedResources(page);
    let total = await resourceInfoDao.count({purchasedResources:{$elemMatch:{$ne:null}}});
    if(resourceInfoList !== undefined && resourceInfoList.length > 0 ){
      page.lastId = resourceInfoList[resourceInfoList.length -1]._id;
    }
    let data = {
      total:total,
      resourceInfoList: resourceInfoList,
      page: page
    }
    res.send({status:1,msg:"success",data:data});
  }catch (e) {
    logger.error("get purchased resource list fail.",{
      page:page
    },e);
    res.send({status:0,msg:"get purchased resource list fail."+e.message});
  }
}

exports.getTenantableResourceListByPage = async function(req, res, next) {
  let page = req.body.page;
  try{
    page = validatePage(page);
    let resourceInfoList = await resourceInfoDao.findTenantableResources(page);
    let total = await resourceInfoDao.count({tenantableResources:{$elemMatch:{$ne:null}}});
    if(resourceInfoList !== undefined && resourceInfoList.length > 0 ){
      page.lastId = resourceInfoList[resourceInfoList.length -1]._id;
    }
    let data = {
      total:total,
      resourceInfoList: resourceInfoList,
      page: page
    }
    res.send({status:1,msg:"success",data:data});
  }catch (e) {
    logger.error("get tenantable resource list fail.",{
      page:page
    },e);
    res.send({status:0,msg:"get tenantable resource list fail."+e.message});
  }
}

exports.getPurchasedResourceOwnerListById = async function(req,res,next) {
  let id = req.param("id");
  logger.info("getPurchasedResourceOwnerListById",{id:id});
  try{
    objectUtils.notNullAssert(id);
    let ownerList = await resourceInfoDao.findPurchasedResourceOwners(id);
    res.send({status:1,msg:"success",data:ownerList});
  }catch (e) {
    logger.error("get resource info detail fail.",{
      id:id
    },e);
    res.send({status:0,msg:"get purchased resource owners fail."});
  }
}

exports.getTenantableResourceOwnerListById = async function(req,res,next) {
  let id = req.param("id");
  logger.info("getTenantableResourceOwnerListById",{id:id});
  try{
    objectUtils.notNullAssert(id);
    let ownerList = await resourceInfoDao.findTenantableResourceOwners(id);
    res.send({status:1,msg:"success",data:ownerList});
  }catch (e) {
    logger.error("getTenantableResourceOwnerListById fail.",{
      id:id
    },e);
    res.send({status:0,msg:"get tenantable resource owners fail."});
  }
}

function validatePage(page){
  if (!page){
    return {
      pageSize:10,
      lastId:""
    }
  }
  
  if(page.pageSize<=0 || page.pageSize>20){
    throw new Error("pageSize必须在(0,20]之间.");
  }
  
  return page;
}


