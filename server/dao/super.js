//TODO:使用promise替换callback

var SuperDao = function (model) {
  this.model = model;
};

//add
SuperDao.prototype.add = function (modelObj) {
  if (modelObj) {
    return new Promise((resolve, reject) => {
      let instance = new this.model(modelObj);
      instance.save(function (err, savedObj) {
        if(err){
          reject(err);
        }else{
          resolve(savedObj);
        }
      });
    });
  } else {
    return new Promise(reject => {
      reject(new Error("modelObj is not null."));
    });
  }
}

//edit
SuperDao.prototype.edit = function (modelObj, callback) {
  if (modelObj) {
    let id = modelObj._id;
    this.model.findByIdAndUpdate(id, modelObj, function (err) {
      return callback(err);
    });
  }
}

//update
SuperDao.prototype.update = function (modelObj, callback) {
  if (modelObj) {
    let id = modelObj._id;
    this.model.update({_id: id}, modelObj, function (err, result) {
      return callback(err, result);
    });
  }
}

//deleteById
SuperDao.prototype.deleteById = function (id, callback) {
  if (id) {
    this.model.findByIdAndRemove(id, function (err, obj) {
      return callback(err, obj);
    });
  }
}


//findById
SuperDao.prototype.findById = function (id, callback) {
  this.model.findById(id, function (err, obj) {
    return callback(err, obj);
  })
}

//find
SuperDao.prototype.find = function (option, callback) {
  if (typeof option == 'undefined') {
    option = {};
  }
  this.model.find(option, function (err, list) {
    return callback(err, list);
  });
}


//findOne
SuperDao.prototype.findOne = function (option, callback) {
  this.model.findOne(option, function (err, obj) {
    return callback(err, obj);
  });
}

//remove
SuperDao.prototype.remove = function (option, callback) {
  this.model.remove(option, function (err) {
    return callback(err);
  });
}

SuperDao.prototype.removeAll = function (callback) {
  this.model.remove(function (err, removed) {
    return callback(err, removed);
  });
}


module.exports = SuperDao;
