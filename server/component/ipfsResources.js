const ipfsAPI = require('ipfs-api');
const log4js = require('log4js');
const fs = require('fs');


const logger = log4js.getLogger("dao/ipfsResources");
const ipfs = ipfsAPI({host:'localhost',port:'5001',protocol:'http'});
const baseUrl = "../../local/file"


const IpfsResourcesDao = class {
  constructor() {}
  
  /**
   * 返回当前上传后的hash值
   * @param localUrl
   * @returns {Promise<any>}
   */
  upload(localUrl) {
    return new Promise(function(resolve,reject) {
      fs.readFile(baseUrl+localUrl,function(err,data) {
        if(err){
          logger.error("upload file to ipfs fail.",localUrl,err);
          reject(err);
          return;
        }
        const descBuffer = Buffer.from(data,'utf-8');
        ipfs.add(descBuffer).then((response) => {
          logger.info(response);
          resolve(response[0].hash);
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
      });
    });
  }
  
  download(hash) {
    return new Promise((resolve, reject) => {
      ipfs.cat(hash).then((stream) => {
        let resource = this.utf8ArrayToStr(stream);
    
      });
    });
    
  }
  _utf8ArrayToStr = (array) => {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
      c = array[i++];
      switch(c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
        case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0));
          break;
        default:
          break;
      }
    }
    return out;
  }
  
  
}


module.exports = new IpfsResourcesDao();

