pragma solidity ^0.4.4;


contract Election {
  //model a candidate
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }
  //Store accounts that have voted
  mapping (address => bool) public voters;

  //store candidate
  //Fetch Candidate
  mapping (uint => Candidate) public candidates;
  //store Candidates count
  uint public candidatesCount;

  string public candidate;

  //voted event
  event votedEvent(uint indexed _candidateId);

  function Election() public {
    // constructor
     addCandidate("Candidate 1");
     addCandidate("Candidate 2");
  }

  function addCandidate(string _name) private {
    candidatesCount ++;
    candidates[candidatesCount] = Candidate(candidatesCount,_name,0);

  }

  function vote(uint _candidateId) public {
    //require that they haven't voted before
    require(!voters[msg.sender]);

    //require a vaild candidate
    require(_candidateId>0 && _candidateId <= candidatesCount);

    //record that voter has voted
    voters[msg.sender] = true;

    //update candidate vote count
    candidates[_candidateId].voteCount ++;

    votedEvent(_candidateId);
  }
}
