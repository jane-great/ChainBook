var express = require("express");
var router = express.Router();
var logger = require("morgan");
var fs = require("server/controller/index");

/* GET home page. */
router.get("/", function(req, res, next) {
  var html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8');
  res.send(html);
});

module.exports = router;
