(function(){
  //Get all extensions
  //Require them into an array
  //Go through when needed
  var extReq = {};
  var extList = {};
  // Go through extensions to get action for speech request
  $.getJSON("rules.json", function(extensions) {
    extList = extensions;
    for(var i = 0; i < extList.length; i++){
      extReq[i] = require("rules/" + extList[i]["name"] + "/hub.js");
    }
  });
  module.exports.extensions = function(){
    return extList;
  }
  module.exports.layer1 = function(speech, callback){
    var countDone = 0;
    for(var i = 0; i < extList.length; i++)
    {
        var Rule = extReq[i];
        Rule.processSpeech(speech, function(ruleRes){
          if(ruleRes.done === true){
            callback(true);
          }
          countDone++;

          if(firstExtensionsCompletedCount == extensions.length){
            callback(false);
          }
        });
    }
  }
  module.exports.layer2 = function(response, speech, callback){
    //Search extension to process action and return
    var countDone = 0;
    if (extList.length > 0) {
      //TODO extension's callback is executed only after all extensions are done,
      //cause compiler is going through loop without stopping and waiting until extension is done.
      for(var i = 0; i < extList.length; i++)
        {
          var Rule = extReq[i];
            Rule.processActionFromSpeech(response.result.action, response.result.parameters, response.result.metadata.emotion, speech, function(ruleRes){
              countDone++;

              if(ruleRes.done === true){
                //Done, extension used
                callback(true);
              }else{
                if(countDone == extList.length){
                  //Done, no extension found
                  callback(false);
                }
              }
            });
        }
      }else{
        callback(false);
      }
  }
})();
