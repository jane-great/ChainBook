pragma solidity ^0.4.4;


contract helloWorld {
  function helloWorld(){
    // constructor

  }

  function sayHello() returns(string) {
      return ("helloWorld");
  }

  function echo(string name) constant returns (string){
      return name;
  }
}
