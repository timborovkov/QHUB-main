  var qapi = require('./qapi');
  var translates = [];
  module.exports.prepareTranslates = function(callback){
    $.getJSON( "./translations.json", function( data ) {
      translates = data;
      callback();
    });
  }
  module.exports.getGUIText = function(word){
    if (qapi.getUserLang() == "en") {
      textOnGUI = word;
    }else{
      $.each(translates, function(engWord, translations){
        if(engWord == word){
          $.each(translations, function(key, val){
            if(key == qapi.getUserLang()){
              textOnGUI = val;
              return;
            }
          });
        }
      });
    }
    return textOnGUI;
  }
