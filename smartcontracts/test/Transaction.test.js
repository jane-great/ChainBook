var BuyAndSell = artifacts.require("./BuyAndSell.sol");
var RentAndLease = artifacts.require("./RentAndLease.sol");
var Transaction = artifacts.require("./Transaction.sol");
var BookOwnerShip = artifacts.require("./BookOwnerShip.sol");

contract("Transaction", function(accounts) {
  var buys;
  var rents;
  var book;
  var trans;
  BookOwnerShip.deployed().then(function(ins) {
    book = ins;
  })
  Transaction.deployed().then(function(ins) {
    trans = ins;
  })
  BuyAndSell.deployed().then(function(ins) {
    buys = ins;
  })
  RentAndLease.deployed().then(function(ins) {
    rents = ins;
  })


  it("初始化成功", async () => {
    let addr = await trans.ceoAddress();
    assert.equal(addr, accounts[0], "ceo地址设置正确");
    await buys.addAddressToWhitelist(trans.address);
    await rents.addAddressToWhitelist(trans.address);
  })

  it("只有ceo可以设置合约地址", async () => {
    await trans.setBuyAndSell(buys.address,{from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    });
    let buyAddr = await trans.buyAndSell();
    assert.equal(buyAddr, 0, "买卖合约地址尚未设置");

    await trans.setBuyAndSell(buys.address);
    let buyAddr2 = await trans.buyAndSell();
    assert.equal(buyAddr2, buys.address, "买卖合约地址设置正确");

    await trans.setBuyAndSell(rents.address,{from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    });
    let rentAddr = await trans.rentAndLease();
    assert.equal(rentAddr, 0, "租赁合约地址尚未设置");

    await trans.setRentAndLease(rents.address);
    let rentAddr2 = await trans.rentAndLease();
    assert.equal(rentAddr2, rents.address, "租赁合约地址设置正确");
  })


  it("只有ceo可以设置交易费用", async () => {
    // 不是ceo不能设置交易价格
    await trans.setBuyFees(1,{from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    })
    let buyfees = await trans.getBuyFees();
    assert.equal(buyfees, 0, "买卖比例为初始值");

    // ceo 可以设置交易价格
    await trans.setBuyFees(100);
    let buyfees2 = await trans.getBuyFees();
    assert.equal(buyfees2, 100, "买卖比例为100");

    // 不是ceo，不能设置租赁价格
    await trans.setLeaseFees(1,{from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    })
    let rentfees = await trans.getLeaseFees();
    assert.equal(rentfees, 0, "租赁比例为0");

    // ceo,可以设置租赁价格
    await trans.setLeaseFees(100);
    let rentfees2 = await trans.getLeaseFees();
    assert.equal(rentfees2, 100, "租赁比例为100");
  })

  it("出售书籍", async () => {
    // 不是所有者，不允许出售书籍
    await book.approve(trans.address,0, {from:accounts[0]});

    await trans.sell(book.address, 0, 100, {from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "非所有者不能出售图书");
    })
    let owner = await book.ownerOf(0);
    assert(owner, accounts[0], "图书所有者不变");

    // 图书所有者，允许出售图书
    await trans.sell(book.address, 0, 100, {from:accounts[0]}); // 出售图书
    let owner3 = await book.ownerOf(0);
    assert.equal(owner3, trans.address, "图书所有权转移到合约");

    await book.transfer(accounts[0], 0).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "出售书籍后，原所有者无法转移图书所有权");
    })
    let owner2 = await book.ownerOf(0);
    assert.equal(owner2, trans.address, "图书所有权不变");
    let allowRead = await book.allowToRead(accounts[0], 0);
    assert.equal(allowRead, false, "出售书籍后无法阅读图书");
  })

  it("修改出售价格", async () => {
    // 不是所有者，不允许修改价格
    await  trans.setSellPrice(book.address, 0, 1, {from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "不是所有者不允许修改价格");
    })
    let sellinfo = await trans.getSellInfo(book.address, 0);
    assert.equal(sellinfo[0], accounts[0], "售卖人不变");
    assert.equal(sellinfo[1].toNumber(), 100, "售卖价格不变");

    // 图书所有者，允许修改价格
    await trans.setSellPrice(book.address, 0 , 1000, {from:accounts[0]});
    let info = await trans.getSellInfo(book.address, 0);
    assert.equal(info[0], accounts[0], "售卖人不变");
    assert.equal(info[1].toNumber(), 1000, "售卖价格变为1000");
    let owner = await book.ownerOf(0);
    assert.equal(owner, trans.address, "图书所有权在合约");
  })

  it("取消出售", async () => {
    // 不是所有者，不允许出售
    await trans.cancelSell(book.address, 0, {from:accounts[1]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "不是所有者不允许取消出售");
    })
    let addr = await book.ownerOf(0);
    assert.equal(addr, trans.address, "图书所有权不变");

    // 图书所有者，出售成功
    await trans.cancelSell(book.address,0);
    let addr2 = await book.ownerOf(0);
    assert.equal(addr2, accounts[0], "图书所有者变为accounts[0]");
    let approveAddr = await book.getApproved(0);
    assert.equal(approveAddr, 0, "图书授权取消");
    let allowRead = await book.allowToRead(accounts[0], 0);
    assert.equal(allowRead, true, "accounts[0]允许阅读图书");
  })

  it("购买图书", async () => {
    // 重新出售图书
    await book.approve(trans.address, 0);
    await trans.sell(book.address, 0, 999);

    // 金额不够，购买失败
    await trans.buy(book.address, 0, {from:accounts[1], value: 10}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "金额不够，购买失败");
    })
    let owner = await book.ownerOf(0);
    assert.equal(owner, trans.address, "图书所有权不变");

    // 金额足够，购买成功
    await trans.buy(book.address, 0, {from:accounts[2], value: 1000});
    let owner2 = await book.ownerOf(0);
    assert.equal(owner2, accounts[2], "accounts[2]拥有图书0");
    let allowRead = await book.allowToRead(accounts[2], 0);
    assert.equal(allowRead, true, "accounts[2]允许阅读图书");
  })


  it("出租图书", async () => {
    await book.approve(trans.address, 0, {from:accounts[2]});
    // 不是所有者，不能出租图书
    await trans.rent(book.address, 0 , 10, 3600, {from:accounts[0]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "不是所有者不允许出租");
    })

    // 所有者允许出租图书
    await trans.rent(book.address, 0, 10000, 3600, {from:accounts[2]});
    let owner = await book.ownerOf(0);
    assert.equal(owner, accounts[2], "accounts[2]拥有图书所有权");
    let allowRead = await book.allowToRead(accounts[2], 0 );
    assert.equal(allowRead, true, "accounts[2]允许阅读图书");
  })

  it("修改出售信息", async () => {
    // 不是所有者，不允许修改出售信息
    await trans.setRentInfo(book.address, 0, 1, 7200, {from: accounts[0]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "不是所有者修改出售信息");
    })
    let info = await trans.getRentInfo(book.address, 0);
    assert.equal(info[0], accounts[2], "所有者不变");
    assert.equal(info[1].toNumber(), 10000, "价格不变");
    assert.equal(info[3].toNumber(), 3600, "出售时间不变");

    // 图书所有者允许修改出售信息
    await trans.setRentInfo(book.address, 0, 20000, 7200, {from:accounts[2]});
    let res = await trans.getRentInfo(book.address, 0);
    assert.equal(res[0], accounts[2], "所有者不变");
    assert.equal(res[1].toNumber(), 20000, "价格变为20000");
    assert.equal(res[3].toNumber(), 7200, "出售时间变为7200");
    let owner = await book.ownerOf(0);
    assert.equal(owner, accounts[2], "图书所有者还是accounts[2]");
  })

  it("取消出租", async () => {
    // 不是所有者，不允许取消出租
    await trans.cancelRent(book.address, 0, {from:accounts[0]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "不是所有者不允许取消");
    })
    let res = await book.isRent(0);
    assert.equal(res, true, "图书正在出租");

    // 图书所有者运行取消出租
    await trans.cancelRent(book.address, 0, {from:accounts[2]});
    let res2 = await book.isRent(0);
    assert.equal(res2, false, "图书已经取消出租");
    let owner = await book.ownerOf(0);
    assert.equal(owner, accounts[2], "图书所有者不变");
    let allowRead = await book.allowToRead(accounts[2], 0);
    assert.equal(allowRead, true, "账户2允许阅读图书");
  })

  it("租赁图书", async () => {
    // 重新出售图书
    await book.approve(trans.address, 0, {from:accounts[2]});
    await trans.rent(book.address, 0, web3.toWei(1,'ether'), 2, {from:accounts[2]});

    // 金额不够，租赁失败
    await trans.lease(book.address, 0, {from:accounts[1], value:1000}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "金额不够，租赁失败");
    })
    let allowRead = await book.allowToRead(accounts[1], 0);
    assert.equal(allowRead, false, "不允许阅读");
    let leaser = await book.tokenIdToLeaser(0);
    assert.equal(leaser, 0, "无人租赁");


    // 金钱足够，租赁成功
    await trans.lease(book.address, 0, {from:accounts[1], value:web3.toWei(3,'ether')});
    let allowRead2 = await book.allowToRead(accounts[1],0);
    assert.equal(allowRead2, true, "允许账户1阅读");
    let allowRead3 = await book.allowToRead(accounts[2],0);
    assert.equal(allowRead3, false, "不允许账户2阅读");
    let owner = await book.ownerOf(0);
    assert.equal(owner, accounts[2], "图书所有权不转移");
    let leaser2 = await book.tokenIdToLeaser(0);
    assert.equal(leaser2, accounts[1], "账户1为租赁人");
    let islease = await book.isLease(0);
    assert.equal(islease, true, "书籍正在租赁");
    await trans.cancelRent(book.address, 0, {from:accounts[2]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "租赁时不允许取消租赁");
    })
    await book.rentCancel(0,{from:accounts[2]}).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "租赁时不允许取消租赁");
    })
  })

  it("提款成功", async () => {
    let balance02 = web3.fromWei(web3.eth.getBalance(accounts[2]).toNumber(),'ether');
    await trans.withdraw({from:accounts[2]});
    let balance12 = web3.fromWei(web3.eth.getBalance(accounts[2]).toNumber(),'ether');
    assert.equal(balance12 > balance02 + web3.toWei(0.5,'ether'), true, "转账成功");
    let balance01 = web3.fromWei(web3.eth.getBalance(accounts[1]).toNumber(),'ether');
    await trans.withdraw({from:accounts[1]});
    let balance11 = web3.fromWei(web3.eth.getBalance(accounts[1]).toNumber(),'ether');
    assert.equal(balance11 > balance01 + web3.toWei(0.5,'ether'), true, "转账成功");
  })

})
