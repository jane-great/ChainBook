var log4js = require('log4js');
var logger = log4js.getLogger('controller/resourceInfo');
var userDao = require("../dao/user");
var resourceInfoDao = require("../dao/resourceInfo");
var resourceCopyrightDao = require("../dao/resourceCopyright");
var resourceContractDao = require("../dao/resourceContract");
const transactionContractDao = require("../dao/transactionContract");
const objectUtils = require("../utils/objectUtils");
const localUpload = require("../component/localUpload");
const config = require("../config");

//已发行
const PUBLISHED = 1;

/**
 * 发布资源，post方法
 * @param req
 * @param res
 * @param next
 */
exports.publishResource = async function(req, res, next) {
  //TODO 校验表单数据
  let copyrightId = req.body.copyrightId;
  let resourceName = req.body.resourceName;
  let desc = req.body.desc;
  let total = req.body.total;
  let coverImage = req.body.coverImage;
  let price = req.body.price;
  let user = req.session.passport.user;
  let authorAccount = user.account;
  try{
    //1、先校验该版权是否具备发行的资格
    let copyright = await resourceCopyrightDao.findOne({_id:copyrightId,auditStatus:1});
    if(!copyright){
      res.send({status:0,msg:"该版权目前不具备发行资格"});
      return;
    }
    //2、验证该版权是否已经发行过
    if(copyright.publishStatus > 0){
      res.send({status:0,msg:"该版权已经发行过了"});
      return;
    }
    //2、先将发行的数据登记进数据库中,2,3可以同时进行
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
    let saveObj = await resourceInfoDao.add(resourceInfo);
    //3、创建资源合约 TODO 待对接
    let resourceAddress = await resourceContractDao.publishResource(user,resourceInfo);
    //4、登记发行状态、合约地址 ,4在3的后面
    await resourceInfoDao.modifyResourceAddress(saveObj._id.toString(),resourceAddress);
    await resourceCopyrightDao.modifyPublishStatus(copyrightId,PUBLISHED,resourceAddress);
    await userDao.modifyCopyrightInfo(user._id,copyrightId,resourceAddress);
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
    res.send({status:1,msg:'success',data:{path:'http://'+config.server.domain+'/images/'+file.filename}});
  });
}

/**
 * 先向作者买
 * @param req
 * @param res
 * @param next
 */
exports.buyFromAuthor = async function(req, res, next){
  let resourceId = req.body.resourceId;
  let user = req.session.passport.user;
  logger.info("enter buyFromAuthor",{
    resourceId:resourceId,
    user:user
  });
  try{
    let resourceInfo = await resourceInfoDao.findSellOutStatusById(resourceId);
    if(resourceInfo == null || resourceInfo == undefined){
      res.send({status:0,msg:"该资源已不可售"});
    }
    //需要时考虑一下事务
    //TODO 调用资源合约的向作者购买的方法
    //TODO 转账
    let tokenId = "test tokenId";
    //合约购买成功后会回调登记用户的已购买
    let purchasedResource = userDao.buildEmptyPurchasedResource();
    purchasedResource.tokenId = tokenId;
    purchasedResource.resourceName = resourceInfo.resourceName;
    purchasedResource.resourceId = resourceId;
    await userDao.addPurchasedResourceByUser(user._id,purchasedResource);
    res.send({status:1,msg:"购买成功"})
  }catch (e) {
    logger.error("enter buyFromAuthor",{
      resourceId:resourceId,
      user:user
    },e);
    res.send({status:1,msg:"购买失败"});
  }
}

/**
 * 购买一个资源
 * @param req
 * @param res
 * @param next
 */
exports.buy = async function (req, res, next) {
  let user = req.session.passport.user;
  let tokenId = req.body.tokenId;
  let resourceId = req.body.resourceId;
  let userAccount = user.account;
  logger.info("enter buy",{
    user:user,
    tokenId:tokenId,
    resourceId:resourceId,
    userAccount:userAccount
  });
  try{
    //TODO 校验表格参数
    objectUtils.notNullAssert(tokenId);
    //1.先找到这个资源的地址和这个token的拥有者
    //TODO 校验自己不能买自己出售的书
    let sellResourceDoc = await resourceInfoDao.findSellResourceOwner(resourceId,tokenId);
    let sellResource = sellResourceDoc[0].sellResources[0];
    //2.调用交易合约的购买方法，合约里转移所有权
    let isSuccess = transactionContractDao.buy(tokenId,sellResource.transactionAddress,userAccount,sellResource.ownerAccount);
    if(!isSuccess){
      logger.warn("enter buy",{
        user:user,
        tokenId:tokenId,
        resourceId:resourceId,
        userAccount:userAccount
      });
      res.send({status:0,msg:"购买二手资源失败"});
      return;
    }
    //TODO 事务
    //3、成功后回调删除资源中正在sell的tokenId记录
    await resourceInfoDao.deletePurchasedResource(resourceId,tokenId);
    //4、成功后回调添加当前用户的购买记录
    let purchasedResource = userDao.buildEmptyPurchasedResource();
    purchasedResource.tokenId = tokenId;
    purchasedResource.resourceName = sellResourceDoc[0].resourceName;
    purchasedResource.resourceId = resourceId;
    purchasedResource.transactionAddress = sellResource.transactionAddress;
    await userDao.addPurchasedResourceByUser(user._id,purchasedResource);
    //5、修改原有user的售卖状态
    await userDao.modifySellStatus(sellResource.ownerId,tokenId,2);
    
    res.send({status:1,msg:"购买二手资源成功"});
  }catch (e) {
    logger.error("enter buy",{
      user:user,
      tokenId:tokenId,
      resourceId:resourceId,
      userAccount:userAccount
    },e);
    res.send({status:0,msg:"购买二手资源失败"});
  }
  
}

/**
 * 租赁一个资源
 * @param req
 * @param res
 * @param next
 */
exports.rent = async function(req, res, next) {
  let user = req.session.passport.user;
  let tokenId = req.body.tokenId;
  let resourceId = req.body.resourceId;
  let userAccount = user.account;
  logger.info("enter rent",{
    user:user,
    tokenId:tokenId,
    resourceId:resourceId,
    userAccount:userAccount
  });
  try{
    //TODO 校验表格参数
    objectUtils.notNullAssert(tokenId);
    //1.先找到这个资源的地址和这个token的拥有者
    //TODO 校验自己不能买自己出售的书
    let rentResourceDoc = await resourceInfoDao.findTenantableResourceOwner(resourceId,tokenId);
    let rentResource = rentResourceDoc[0].tenantableResources[0];
    //2.调用交易合约的购买方法，合约里转移所有权
    let isSuccess = transactionContractDao.rent(tokenId,rentResource.transactionAddress,userAccount,rentResource.ownerAccount);
    if(!isSuccess){
      logger.warn("enter rent",{
        user:user,
        tokenId:tokenId,
        resourceId:resourceId,
        userAccount:userAccount,
        rentResourceDoc:rentResourceDoc
      });
      res.send({status:0,msg:"租赁资源失败"});
      return;
    }
    //TODO 事务
    //3、成功后回调删除资源中正在sell的tokenId记录
    await resourceInfoDao.deleteTenantableResource(resourceId,tokenId);
    //4、成功后回调添加当前用户的购买记录
    let rentResourceObj = userDao.buildEmptyRentResource();
    rentResourceObj.tokenId = tokenId;
    rentResourceObj.resourceName = rentResourceDoc[0].resourceName;
    rentResourceObj.resourceId = resourceId;
    rentResourceObj.rentTime = rentResource.rentTime;
    rentResourceObj.transactionAddress = rentResource.transactionAddress;
    await userDao.addRentResourceByUser(user._id,rentResourceObj);
    //5、修改原有user的售卖状态
    await userDao.modifyRentStatus(rentResource.ownerId,tokenId,2);
    
    res.send({status:1,msg:"租赁资源成功"});
  }catch (e) {
    logger.error("enter buy",{
      user:user,
      tokenId:tokenId,
      resourceId:resourceId,
      userAccount:userAccount
    },e);
    res.send({status:0,msg:"租赁资源失败"});
  }
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
    let total = await resourceInfoDao.count({sellResources:{$elemMatch:{$ne:null}}});
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


