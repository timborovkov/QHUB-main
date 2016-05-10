(function(){
  module.exports.processAction = function(action, parameters, speech, emotion, rulePaths, callback){
    var done = true;
    for(var i = 0; i < rulePaths.length; i++){
      var path = rulePaths[i];
      var rule = require(path);
      if(done){
        done = false;
        rule.processAction(action, parameters, speech, emotion, function(){
          done = true;
        });
      }else{
        //Previous extension is still running
        i = i - 1;
      }
    }
    callback();
  }
  module.exports.onStart = function(rulePaths, callback){
    var done = true;
    for(var i = 0; i < rulePaths.length; i++){
      var path = rulePaths[i];
      var rule = require(path);
      if(done){
        done = false;
        rule.onStart(function(){
          done = true;
        });
      }else{
        //Previous extension is still running
        i = i - 1;
      }
    }
    callback();
  }
  module.exports.getRulePaths = function(callback){
    var rules = [];
    $.getJSON( "./rules.json", function( data ) {
      $.each(data, function(key, val){
        rules.push("../rules/" + val.name + "/hub.js");
      });
      callback(rules);
    });
  }
})();
