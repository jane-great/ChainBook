var BookCopyrightCreate = artifacts.require("./BookCopyrightCreate.sol");

contract("BookCopyrightCreate", function(accounts) {
  var copyrightInstance;

  it("合约初始化正确", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
      console.log(instance.address);
      return instance.ceoAddress();
    }).then(function(address) {
      assert.equal(address,accounts[0], "ceoAddress地址正确");
    })
  })

  it("登记信息获取正确", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
      var bookname = "chainbook";
      var authorName = "chainbook";
      var authorAddress = accounts[0];
      var ipfsHash = "chainbook";
      instance.registerCopyright(bookname,authorName,authorAddress,ipfsHash).then(function() {
        instance.getCopyright(1).then(function(result) {
          assert.equal(result[0], bookname, "书名正确");
          assert.equal(result[1], authorName, "作者正确");
          assert.equal(result[2], authorAddress, "作者地址正确");
          assert.equal(result[3], ipfsHash, "ipfsHash正确");
        })
      })
    })
  })

  it("登记个数正确", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
        instance.getBookNum().then(function(num) {
          assert.equal(num.toNumber(), 2, "登记一个版权");
        })
    })
  })

  it("修改登记个数成功", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
        instance.setBookNum(10).then(function() {
          instance.getBookNum().then(function(num) {
            assert.equal(num.toNumber(), 10, "登记十个版权");
          })
        })
    })
  })

  it("修改手续费成功", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
        instance.setFees(1000).then(function() {
            instance.getFees().then(function(num) {
              // console.log(num);
              assert.equal(num.toNumber(), 1000, "手续费修改成功");
            })
        })
    })
  })

  it("非ceo修改手续费失败",function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
      instance.setFees(10, {from: accounts[1]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
        instance.getFees().then(function(num) {
          assert.equal(num.toNumber(), 1000, "手续费不变");
        })
      })
    })
  })

  it("费用不够，登记信息失败", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
      var bookname = "test2";
      var authorName = "TEST2";
      var authorAddress = accounts[0];
      var ipfsHash = "this is a ipfshash";
      instance.registerCopyright(bookname,authorName,authorAddress,ipfsHash).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
        instance.getBookNum().then(function(num) {
          assert.equal(num.toNumber(), 10, "登记十个版权");
        })
      })
    })
  })

  it("费用充足，登记信息成功", function() {
    return BookCopyrightCreate.deployed().then(function(instance) {
      var bookname = "test2";
      var authorName = "TEST2";
      var authorAddress = accounts[0];
      var ipfsHash = "this is a ipfshash";
      instance.registerCopyright(bookname,authorName,authorAddress,ipfsHash,{value:1000}).then(function() {
        instance.getBookNum().then(function(num) {
          assert.equal(num.toNumber(), 11, "登记十一个版权");
        })
      })
    })
  })

})
