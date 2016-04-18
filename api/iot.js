function performHomeAutomation(action, parameters, callback){
  if(action.contains('home')){
    //TODO
    alert(action);
    callback();
  }else{
    callback();
  }
}

window.setInterval(function(){

  //Ask server if there is a task for this hub
  //Perform task
  //Tell server about it

}, 100);
