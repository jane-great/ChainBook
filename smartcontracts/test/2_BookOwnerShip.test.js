var BookCopyrightCreate = artifacts.require("./BookCopyrightCreate.sol");
var BookOwnerShip = artifacts.require("./BookOwnerShip.sol");
var RentAndLease = artifacts.require("./RentAndLease.sol");

contract("BookOwnerShip", function(accounts) {
    // var copyrightAddress = BookCopyrightCreate.address;   // 版权合约地址
    var instance;       // 书籍合约实例
    BookOwnerShip.deployed().then(function(ins) {
      instance = ins;       // 获取实例
    })
    var rent;
    RentAndLease.deployed().then(function(ins) {
      rent = ins;
    })

     it("合约初始化正确", function() {
        instance.getCopyrightInfo().then(function(result) {
          // console.log(copyrightAddress);
          // console.log(instance.address);
          // console.log(result);
          assert.equal(result[0], "chainbook", "书名正确");
          assert.equal(result[1], "chainbook", "作者笔名正确");
          assert.equal(result[2], 3, "发行总量正确");
          assert.equal(result[3], "chainbook", "ipfs地址正确");
          instance.ownerOf(0).then(function(addr) {
            assert.equal(addr, accounts[0], "第一本书送给作者");
          })
          instance.allowToRead(accounts[0], 0).then(function(res) {
            assert.equal(res, true, "作者允许读第一本书");
          })
          instance.balanceOf(accounts[0]).then(function(res) {
            assert.equal(res.toNumber(), 1, "作者只有一本书");
          })
          instance.tokenofOwner(accounts[0]).then(function(res) {
            assert.equal(res.length, 1, "作者只有一本书");
            assert.equal(res[0].toNumber(), 0, "作者拥有第0本书");
          })
          instance.publishedAmount().then(function(res) {
            assert.equal(res.toNumber(), 1, "已经发行1本书");
          })
      })
    })

     it("购买书籍成功", function() {
      instance.buyFromAuthor({from: accounts[1]}).then(function() {
        instance.ownerOf(1).then(function(addr) {
          assert.equal(addr, accounts[1], "accounts[1]拥有图书所有权");
        })
        instance.balanceOf(accounts[1]).then(function(res) {
          assert.equal(res.toNumber(), 1, "accounts[1]只有一本书");
        })
        instance.publishedAmount().then(function(res) {
          assert.equal(res.toNumber(), 2, "已经发行2本书");
        })
        instance.allowToRead(accounts[1],1).then(function(res) {
          assert.equal(res, true, "accounts[1]允许阅读第二本书");
        })
        instance.allowToRead(accounts[1],0).then(function(res) {
          assert.equal(res, false, "accounts[1]不允许读第一本书");
        })
        instance.allowToRead(accounts[0],1).then(function(res) {
          assert.equal(res, false, "作者不允许读第二本书");
        })
      })
    })

     it("个人不允许购买过量书籍", function() {
      instance.buyFromAuthor({from: accounts[1]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
        instance.publishedAmount().then(function(res) {
          assert.equal(res.toNumber(), 2, "已经发行2本书");
        })
      })
    })

    it("作者修改发行价格", function() {
      instance.setPrice(1000, {from: accounts[0]}).then(function() {
        instance.getPrice().then(function(price) {
          assert.equal(price.toNumber(), 1000, "修改后的价格为1000wei");
        })
      })
    })

    it("不是作者，不能修改价格", function() {
      instance.setPrice(10, {from:accounts[1]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      instance.getPrice().then(function(price) {
        assert.equal(price.toNumber(), 1000, "价格为1000wei");
      })
    })

    it("作者更新作者地址", function() {
      instance.setNewAuthorAddress(accounts[5], {from: accounts[0]}).then(function() {
        instance.getAuthorAddress().then(function(addr) {
          assert.equal(addr, accounts[5]);
        })
      })
    })

    it("不是作者，不能更换作者地址",function() {
      instance.setNewAuthorAddress({from: accounts[0]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      }).then(function() {
        instance.getAuthorAddress().then(function(addr) {
          assert(addr, accounts[1], "作者地址还是账户1");
        })
      })
    })

    it("购买价格不够，购买失败", function() {
      instance.buyFromAuthor({from:accounts[2], value: 999}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      instance.publishedAmount().then(function(res) {
        assert.equal(res.toNumber(), 2, "已经发行2本书");
      })
      instance.balanceOf(accounts[2]).then(function(num) {
        assert.equal(num.toNumber(), 0, "账户2拥有0本书")
      })
    })


    it("购买价格足够，购买成功", function() {
      instance.buyFromAuthor({from:accounts[2], value:1001}).then(function() {
        instance.publishedAmount().then(function(num) {
          assert.equal(num.toNumber(), 3, "已经发现3本书");
        })
        instance.ownerOf(2).then(function(addr) {
          assert.equal(addr, accounts[2], "第三个账户拥有第三本图书");
        })
        instance.allowToRead(accounts[2], 2).then(function(res) {
          assert.equal(res, true, "购买后允许阅读");
        })
      })
    })

    it("图书拥有者授权第三方平台", function() {
      instance.approve(accounts[1], 2, {from:accounts[2]}).then(function() {  //授权账户1转移账户2所有权
        instance.ownerOf(2).then(function(addr) {
          assert.equal(addr, accounts[2], "图书所有权不转移");
        })
        instance.allowToRead(accounts[2], 2).then(function(res) {
          assert.equal(res, true, "账户2允许阅读");
        })
        instance.getApproved(2).then(function(addr) {
          assert.equal(addr, accounts[1], "账户1已经获得授权");
        })
        instance.allowToRead(accounts[1], 2).then(function(res) {
          assert.equal(res, false, "账户1不允许阅读");
        })
      })
    })

    // it("非授权第三方不能转移图书所有权",function() {
    //   instance.transferFrom(accounts[2], accounts[4], 2, {from: accounts[3]}).then(assert.fail).catch(function(error) {
    //     assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    //   }).then(function() {
    //     instance.ownerOf(2).then(function(addr) {
    //       assert.equal(addr, accounts[2], "账户2所有权不转移");
    //     })
    //     instance.allowToRead(accounts[4], 2).then(function(res) {
    //       assert.equal(res, false, "账户4不允许阅读");
    //     })
    //     instance.allowToRead(accounts[3], 2).then(function(res) {
    //       assert.equal(res, false, "账户3不允许阅读");
    //     })
    //     instance.getBookInfo(2).then(function(res) {
    //       assert.equal(res[0].toNumber(), 0, "书籍交易次数不变");
    //     })
    //   })
    // })
    //
    // it("已授权第三方转移图书所有权", function() {
    //   instance.transferFrom(accounts[2], accounts[4], 2, {from: accounts[1]}).then(async function() {  // 图书2从账户2转移到账户4
    //     instance.ownerOf(2).then(function(addr) {
    //       assert.equal(addr, accounts[4], "图书所有权转移到账户2");
    //     })
    //     instance.allowToRead(accounts[4], 2) .then(function(res) {
    //       assert.equal(res, true, "账户4允许阅读图书2");
    //     })
    //     instance.balanceOf(accounts[4]).then(function(res) {
    //       assert.equal(res.toNumber(), 1, "账户4拥有一本图书");
    //     })
    //     instance.getApproved(2).then(function(addr) {
    //       assert.equal(addr, 0, "转移成功，取消授权");
    //     })
    //     instance.allowToRead(accounts[2], 2).then(function(res) {
    //       assert.equal(res, false, "原地址不允许阅读图书");
    //     })
    //     await instance.approve(accounts[2], 2, {from: accounts[2]}).then(assert.fail).catch(function(error) { // 原地址不能授权
    //       assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    //       instance.getApproved(2).then(function(addr) {
    //         assert.equal(addr, 0, "授权失败");
    //       })
    //     })
    //     await instance.approve(accounts[1], 2, {from: accounts[4]}).then(function() {
    //       instance.getApproved(2).then(function(addr) {
    //         assert.equal(addr, accounts[1], "授权成功");
    //       })
    //     })
    //   })
    // })
    //
    // it("允许第三方租赁", function() {
    //   instance.approve(rent.address, 2, {from:accounts[4]}).then(function() {
    //     instance.getApproved(2).then(function(addr) {
    //       assert.equal(addr, rent.address, "租赁已经获得授权");
    //     }).then(function() {
    //
    //     })
    //   })
    // })

    it("合约发行总量固定", function() {
      instance.buyFromAuthor({from:accounts[3], value:1001}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
        instance.publishedAmount().then(function(res) {
          assert.equal(res.toNumber(), 3, "已经发行3本书");
        })
      })
    })
})
