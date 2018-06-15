var BookCopyrightCreate = artifacts.require("./BookCopyrightCreate.sol");
var BookOwnerShip = artifacts.require("./BookOwnerShip.sol");

contract("BookOwnerShip",  function(accounts) {
    var instance;       // 书籍合约实例
    BookOwnerShip.deployed().then(function(ins) {
      instance = ins;       // 获取实例
    })

    it("合约初始化正确", async () => {
        let result = await instance.getCopyrightInfo();
        assert.equal(result[0], "chainbook", "书名正确");
        assert.equal(result[1], "chainbook", "作者笔名正确");
        assert.equal(result[2], 3, "发行总量正确");
        assert.equal(result[3], "chainbook", "ipfs地址正确");
        let addr = await instance.ownerOf(0);
        assert.equal(addr, accounts[0], "第一本书送给作者");
        let allowRead = await instance.allowToRead(accounts[0], 0);
        assert.equal(allowRead, true, "作者允许读第一本书");
        let balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 1, "作者只有一本书");
        let ownOne = await instance.tokenofOwner(accounts[0]);
        assert.equal(ownOne.length, 1, "作者只有一本书");
        assert.equal(ownOne[0].toNumber(), 0, "作者拥有第0本书");
        let publishAmount = await instance.publishedAmount();
        assert.equal(publishAmount.toNumber(), 1, "已经发行1本书");
    })

    it("购买书籍成功", async () => {
      await instance.buyFromAuthor({from: accounts[1]});
      let addr = await instance.ownerOf(1);
      assert.equal(addr, accounts[1], "accounts[1]拥有图书所有权");
      let bookNum = await instance.balanceOf(accounts[1]);
      assert.equal(bookNum.toNumber(), 1, "accounts[1]只有一本书");
      let publishAmount = await instance.publishedAmount();
      assert.equal(publishAmount.toNumber(), 2, "已经发行2本书");
      let allowRead11 = await instance.allowToRead(accounts[1],1);
      assert.equal(allowRead11, true, "accounts[1]允许阅读第二本书");
      let allowRead10 = await instance.allowToRead(accounts[1],0);
      assert.equal(allowRead10, false, "accounts[0]不允许读第一本书");
      let allowRead01 = await instance.allowToRead(accounts[0],1);
      assert.equal(allowRead01, false, "作者不允许读第二本书");
    })

    it("个人不允许购买过量书籍", async () => {
      await instance.buyFromAuthor({from: accounts[1]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let res = await instance.publishedAmount();
      assert.equal(res.toNumber(), 2, "已经发行2本书");
    })

    it("作者修改价格", async () => {
      await instance.setPrice(web3.toWei(1,'ether'), {from: accounts[0]});
      let price = await instance.getPrice();
      assert.equal(price.toNumber(), web3.toWei(1,'ether'), "修改后的价格为1000wei");
    })

    it("不是作者，不能修改价格", async () => {
      await instance.setPrice(10, {from:accounts[1]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let price = await instance.getPrice();
      assert.equal(price.toNumber(), web3.toWei(1,'ether'), "价格为1000wei");
    })

    it("作者更新作者地址", async () => {
      await instance.setNewAuthorAddress(accounts[5], {from: accounts[0]});
      let addr = await instance.getAuthorAddress()
      assert.equal(addr, accounts[5], "新地址为accounts[5]");
    })

    it("不是作者，不能更换作者地址",async () => {
      await instance.setNewAuthorAddress(accounts[0], {from: accounts[0]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let addr2 = await instance.getAuthorAddress();
      assert(addr2, accounts[1], "作者地址还是账户1");
    })

    it("购买价格不够，购买失败", async () => {
      await instance.buyFromAuthor({from:accounts[2], value: 999}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let res = await instance.publishedAmount();
      assert.equal(res.toNumber(), 2, "已经发行2本书");
      let num = await instance.balanceOf(accounts[2]);
      assert.equal(num.toNumber(), 0, "账户2拥有0本书")
    })

    it("购买价格足够，购买成功", async () => {
      let balance02 = web3.fromWei(web3.eth.getBalance(accounts[2]).toNumber(),'ether');
      let balance05 = web3.fromWei(web3.eth.getBalance(accounts[5]).toNumber(),'ether');
      await instance.buyFromAuthor({from:accounts[2], value:web3.toWei(3,'ether')});
      let balance12 = web3.fromWei(web3.eth.getBalance(accounts[2]).toNumber(),'ether');
      let balance15 = web3.fromWei(web3.eth.getBalance(accounts[5]).toNumber(),'ether');
      assert.equal(balance15>balance05,true,"作者收到转账");
      assert.equal(balance02-1>balance12,true,"买家收到退款");
      let num = await instance.publishedAmount();
      assert.equal(num.toNumber(), 3, "已经发行3本书");
      let addr = await instance.ownerOf(2)
      assert.equal(addr, accounts[2], "第三个账户拥有第三本图书");
      let res = await instance.allowToRead(accounts[2], 2);
      assert.equal(res, true, "购买后允许阅读");
    })

    it("图书拥有者授权第三方平台", async () => {
      await instance.approve(accounts[1], 2, {from:accounts[2]});
      let addr = await instance.ownerOf(2);
      assert.equal(addr, accounts[2], "图书所有权不转移");
      let res = await instance.allowToRead(accounts[2], 2);
      assert.equal(res, true, "账户2允许阅读");
      let approveAddr = await instance.getApproved(2)
      assert.equal(approveAddr, accounts[1], "账户1已经获得授权");
      let allowRead = await instance.allowToRead(accounts[1], 2);
      assert.equal(allowRead, false, "账户1不允许阅读");
    })

    it("非授权第三方不能转移图书所有权",async () => {
      await instance.transferFrom(accounts[2], accounts[4], 2, {from: accounts[3]}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let addr = await instance.ownerOf(2)
      assert.equal(addr, accounts[2], "账户2所有权不转移");
      let allowRead4 = await instance.allowToRead(accounts[4], 2)
      assert.equal(allowRead4, false, "账户4不允许阅读");
      let allowRead3 = await instance.allowToRead(accounts[3], 2)
      assert.equal(allowRead3, false, "账户3不允许阅读");
      let transTime = await instance.getBookInfo(2)
      assert.equal(transTime[0].toNumber(), 0, "书籍交易次数不变");
    })

    it("已授权第三方转移图书所有权", async () => {
      await instance.transferFrom(accounts[2], accounts[4], 2, {from: accounts[1]});
      let addr = await instance.ownerOf(2);
      assert.equal(addr, accounts[4], "图书所有权转移到账户2");
      let res = await instance.allowToRead(accounts[4], 2);
      assert.equal(res, true, "账户4允许阅读图书2");
      let ownNum = await instance.balanceOf(accounts[4])
      assert.equal(ownNum.toNumber(), 1, "账户4拥有一本图书");
      let addr2 = await instance.getApproved(2);
      assert.equal(addr2, 0, "转移成功，取消授权");
      let allowRead = await instance.allowToRead(accounts[2], 2);
      assert.equal(allowRead, false, "原地址不允许阅读图书");

      await instance.approve(accounts[2], 2, {from: accounts[2]}).then(assert.fail).catch(function(error) { // 原地址不能授权
          assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let addr3 = await instance.getApproved(2);
      assert.equal(addr3, 0, "授权失败");
    })

    it("合约发行总量固定", async () => {
      await instance.buyFromAuthor({from:accounts[3], value:1001}).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      })
      let res = await instance.publishedAmount();
      assert.equal(res.toNumber(), 3, "已经发行3本书");
    })

})
