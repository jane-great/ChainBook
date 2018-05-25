App = {
  web3Provider: null,
  contracts: {},
  account:'0x0',

  init: function() {
    // Load data

    return App.initWeb3();
  },

  initWeb3: function() {
    /*
     * Replace me...
     */
     if(typeof web3 !== 'undefined'){
       App.web3Provider = web3.currentProvider;
       web3 = new Web3(web3.currentProvider);
     } else {
       App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
       web3 = new Web3(App.web3Provider);
     }
    return App.initContract();
  },

  initContract: function() {
    /*
     * Replace me...
     */
     $.getJSON("Election.json",function(election){
       App.contracts.Election = TruffleContract(election);
       App.contracts.Election.setProvider(App.web3Provider);
       App.listenForEvents();
       return App.render();
     });
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance){
      instance.votedEvent({},{
        formBlock:0,
        toBlock:'latest'
      }).watch(function(error,event) {
        console.log("even triggered",event);
        App.render();
      });

    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    //load account data
    web3.eth.getCoinbase(function(err,account) {
      if(err === null){
        App.account = account;
        $("#accountAddress").html("Your Account:" + account);
      }
    });

    //load contact data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function (candidatesCount){
      // get html element
      var candidateResults = $("#candidateResults");
      candidateResults.empty();

      var candidateSelect = $("#candidateSelect");
      candidateSelect.empty();


      for(var i = 1;i <= candidatesCount;i++){
        electionInstance.candidates(i).then(function(candidate){
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          var candidateTemplate = "<tr><th>"+id+"</th><td>"+name+"</td><td>"+voteCount+"</td><tr>";
          candidateResults.append(candidateTemplate);

          var candidateOption = "<option value='"+id+"'>"+name+"</option>";
          candidateSelect.append(candidateOption);
        });
      }

      return electionInstance.voters(App.account);

    }).then(function(hasVoted){
      if(hasVoted){
        $("form").hide();
      }

      loader.hide();
      content.show();
    })
    .catch(function(err){
      console.warn(err);
    });
  },
  castVote: function() {
    var candidateId = $('#candidateSelect').val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.vote(candidateId,{from:App.account});
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
