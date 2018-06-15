const log4js = require('log4js');
const logger = log4js.getLogger('controller/resourceCopyright');
const userDao = require("../dao/user");
const resourceCopyrightDao = require("../dao/resourceCopyright");
const copyrightContractDao = require("../dao/copyrightContract");
const objectUtils = require("../utils/objectUtils");
const encrypt = require("../utils/encrypt");
const localUpload = require("../component/localUpload");
const ipfsResourcesDao = require("../component/ipfsResources");

const NO_AUDIT = 0;
const NO_PUBLISH = 0;

/**
 * 申请版权
 * @param req
 * @param res
 * @param next
 */
exports.applyCopyright = async function(req,res,next){
  let user = req.session.passport.user;
  let copyright = {
    workName: req.body.workName,
    workCategory: req.body.workCategory,
    localUrl:req.body.localUrl,
    account:user.account,
    authors:req.body.authors,
    workProperty:req.body.workProperty,
    rights:req.body.rights,
    belong:req.body.belong,
    auditStatus:NO_AUDIT,
    publishStatus:NO_PUBLISH
  }
  
  try{
    
    //TODO 需要校验是否重复提交内容
    //TODO 校验数据的合法性，表单校验
    objectUtils.isEmptyObject(copyright);
    objectUtils.isEmptyObject(copyright.authors);
    objectUtils.isEmptyObject(copyright.rights);
    //先将申请的版权信息登记进数据库
    let savedObj = await resourceCopyrightDao.add(copyright);
    //将数据保存至user
    let copyrightObj = userDao.buildEmptyCopyright();
    copyrightObj.localUrl = savedObj.localUrl;
    copyrightObj.copyrightId = savedObj._id;
    copyrightObj.workName = savedObj.workName;
    await userDao.addCopyRightByUser(user._id,copyrightObj);
    logger.info("apply copyright success",copyright);
    res.send({status:1,msg:"申请版权信息保存成功"});
  }catch (e) {
    logger.error("save copyright fail",{ copyright: copyright},e);
    res.send({status:0,msg:"申请版权信息保存失败"});
  }
}

/** TODO
 * 上传样本至服务器
 * @param req
 * @param res
 * @param next
 */
exports.uploadSample = function(req,res,next){
  let upload = localUpload.fileUpload.single("sample");
  upload(req,res,function(err) {
    if(err){
      logger.error("upload fail",err);
      res.send({status:0,msg:'上传样本失败'});
      return;
    }
    var file = req.file;
    if(!file){
      res.send({status:0,msg:'上传样本失败'});
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

exports.auditCopyright = async function(req,res,next){
  let user = req.session.passport.user;
  let copyrightId = req.body.copyrightId;
  let isSuccess = await registerCopyright(user,copyrightId);
  if(isSuccess){
    res.send({status:1,msg:"审核版权成功"});
  }else{
    res.send({status:0,msg:"审核版权失败"});
  }
}


/**
 * 登记版权至合约，将被登记合约的定时任务调用 TODO
 * @param req
 * @param res
 * @param next
 */
let registerCopyright = async function(userObj,copyrightId){
  try{
    //1、根据userAccount捞取基本用户信息
    let account = userObj.account;
    let copyrightObj = await resourceCopyrightDao.findOne({_id:copyrightId,account:account});
    if(copyrightObj.auditStatus > 0){
      logger.warn("该版权审核通过或者失败",{
        userObj:userObj,
        copyrightObj:copyrightObj
      });
      return false;
    }
    logger.info("register copyright",{
      user:userObj,
      copyrightId:copyrightId,
      copyrightObj:copyrightObj
    });
    //2、将本地的最新样本上传至ipfs，并获得hash值
    let resourceHash = await ipfsResourcesDao.upload(copyrightObj.localUrl,userObj);
    let resourceDHash = encrypt.getMD5(resourceHash,"");
    //3、调用合约的登记版权的方法，登记合约,保存版权的信息和版权的hash值，并返回合约地址
    copyrightObj.resourceHash = resourceHash;
    copyrightObj.resourceDHash = resourceDHash;
      let copyrightAddress = await copyrightContractDao.registerCopyright(userObj,copyrightObj);
    //4、登记hash，dhash,合约地址，审核状态等至resourceCopyright和user中
    await resourceCopyrightDao.updateResourceCopyrightInfo(copyrightObj._id,copyrightAddress,resourceHash,resourceDHash,1);
    //5、登记到用户的版权信息下
    await userDao.modifyCopyrightAuditInfo(userObj._id,copyrightObj._id,resourceHash,resourceDHash,copyrightAddress);
    return true;
  }catch (e) {
    logger.error("registerCopyright fail.",{
      user:userObj,
      copyrightId:copyrightId
    },e);
    return false;
  }
}

/**
 * 根据id获取资源版权细节
 * @param req
 * @param res
 * @param next
 */
exports.getResourceCopyrightDetailById = async function(req, res, next) {
  let id = req.param('id');
  logger.info("getResourceCopyrightDetailById",{id:id});
  try{
    objectUtils.notNullAssert(id);
    let resourceCopyright = await resourceCopyrightDao.findById(id);
    res.send({status:1,msg:"success",data:resourceCopyright});
  }catch (e) {
    logger.error("get resource copyright detail fail.",id,e);
    res.send({status:0,msg:"get resource copyright detail fail."});
  }
}
