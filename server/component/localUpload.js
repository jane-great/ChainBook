const multer  = require('multer');
const log4js = require('log4js');
const logger = log4js.getLogger('component/localUpload');
const encrypt = require('../utils/encrypt');

//TODO 参数化
const ImagePath = "local/image";
const FilePath = "local/file";

var imageStorage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹会自动创建。
  destination: function (req, file, cb) {
    cb(null, ImagePath);
  },
  //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-' + encrypt.getRandom() + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});

//图片最大上传1024kb
var imageUpload = multer({
  storage: imageStorage,
  limits:{
    //fileSize:1024
  },
  fileFilter:function(req,file,cb) {
    //校验是否是对应图片类型
    var strRegex = "(.jpg|.png|.gif|.ps|.jpeg)$"; //用于验证图片扩展名的正则表达式
    var reg=new RegExp(strRegex);
    if(!reg.test(file.originalname.toLowerCase())){
      logger.warn("upload image format invalid",{
        mimetype:file.mimetype,
        originalname:file.originalname
      });
      cb(null,false);
    }else{
      cb(null,true);
    }
  }
});

const fileStorage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹会自动创建。
  destination: function (req, file, cb) {
    cb(null, FilePath);
  },
  //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-'+ encrypt.getRandom() + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});

var fileUpload = multer({
  storage: fileStorage,
  limits:{
    //限制文件大小
    //fileSize:1024
  },
  fileFilter:function(req,file,cb) {
    var strRegex = "(.doc|.pdf|.txt)$"; //用于验证文件扩展名的正则表达式
    var reg=new RegExp(strRegex);
    if(!reg.test(file.originalname.toLowerCase())){
      logger.warn("upload image format invalid",{
        mimetype:file.mimetype,
        originalname:file.originalname
      });
      cb(null,false);
    }else{
      cb(null,true);
    }
  }
  
});

//导出对象
module.exports = {
  imageUpload:imageUpload,
  fileUpload:fileUpload
};
