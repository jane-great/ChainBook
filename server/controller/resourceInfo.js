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
  logger.info("publish resource");
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
      res.send({status:0,msg:"改版权目前不具备发行资格"});
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
  }catch (e) {
    logger.error("publish fail",{
      resourceName:resourceName,
      desc:desc,
      total:total,
      coverImage:coverImage,
      price:price,
      copyrightAddress:copyright.copyrightAddress,
      authorAccount:authorAccount,
      hasSellOut:0,
    },e);
    res.send({status:0,msg:"发行失败请重发行"});
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
  let id = req.param.id;
  logger.info("getResourceDetailById",{id:id});
  try{
    objectUtils.notNullAssert(id);
    let resourceInfo = await resourceInfoDao.findById(id);
    res.send({status:1,msg:"success",data:resourceInfo});
  }catch (e) {
    logger.error("get resource info detail fail.",{
      id:id
    },e);
    res.send({status:0,msg:"get resource info detail fail."});
  }
}
