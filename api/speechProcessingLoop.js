(function(){
  /*
  *     prepare
  */
  var qapi = require('./qapi');
  global.qapi = qapi;
  var international = require('./international'),
  ext = require('./extensions');
  a = 1,
  wakeUpListener = new webkitSpeechRecognition(),
  mainListener = new webkitSpeechRecognition(),
  speakerMessage = new SpeechSynthesisUtterance(),
  voices = null,
  lastActionHappened = 0;

  /*
  *
  *     Loop functions
  *
  */
  function restartMainVoiceLoop(){
    wakeUpListener = new webkitSpeechRecognition();
    mainListener = new webkitSpeechRecognition();
    startMainVoiceLoop();
  }
  function startMainVoiceLoop(){
    waitForWakeup(international.getGUIText('hello'), function(){
        up();
    });
  }
  function up(){
    speechToText(function(notFinalSpeech){
      //Not final speech
      },function(speech){
        afterGetSpeech(speech);
      });
  }
  function afterGetSpeech(speech){
    lastActionNow();
    if(speech.contains("secret") && speech.contains("code")){
      tellHubSecret();
      eval("up()");
    }else{
      doSpeechProcessing(speech, function(){
        eval("up()");
      });
    }
  }

  function afterFirstExtensionsAreDone(callBack, speechRuleFound, speech){
      if(!speechRuleFound){
          //Get action, speech response and options from Api.ai
          qapi.apiAi(speech, function(response){
            lastActionNow();
            if(response.status.code != "200"){
              qSay(international.getGUIText("Sorry I didn't get that"), function(){
                callBack();
              });
            }else{
              performHomeAutomation(response.result.action, response.result.parameters, function(){
                var speechResponse = response.result.fulfillment.speech;
                var htmlResponse = response.result.metadata.html;
                ext.layer2(response, speech, afterSecondExtensionsAreDone);
              });
            }
            function afterSecondExtensionsAreDone(actionRuleFound){
                if(!actionRuleFound){
                  if(speechResponse != null || speechResponse != ""){
                    qSay(speechResponse, function(){
                      callBack();
                    });
                  }else if(htmlResponse != null || htmlResponse != ""){
                    qSay(htmlResponse, function(){
                      callBack();
                    });
                  }else{
                    qSay('OK', function(){
                      callBack();
                    });
                  }
                }else{
                  callBack();
                }
            }
          });
      }else{
        //Speech already processed
        callBack();
      }
  }
function doSpeechProcessing(speech, callBack){
          if(ext.extensions().length === 0){
            //No extensions found
            //Get action, speech response and options from Api.ai
            qapi.apiAi(speech, function(response){
              if(response.status.code != "200"){
                qSay(international.getGUIText("Sorry I didn't get that"), function(){
                  callBack();
                });
              }else{
                performHomeAutomation(response.result.action, response.result.parameters, function(){
                  var speechResponse = response.result.fulfillment.speech;
                  var htmlResponse = response.result.metadata.html;
                  lastActionNow();
                  if(speechResponse != null || speechResponse != ""){
                    qSay(speechResponse, function(){
                      callBack();
                    });
                  }else if(htmlResponse != null || htmlResponse != ""){
                    qSay(htmlResponse, function(){
                      callBack();
                    });
                  }else{
                    qSay('OK', function(){
                      callBack();
                    });
                  }
                });
              }
            });
          }else{
            ext.layer1(speech, function(done){
              afterFirstExtensionsAreDone(callBack, done, speech);
            });
          }
  }

  /*
  *
  *     Loop
  *
  */
  module.exports.beginSPL = function(){
    //Prepare speaker
    var voices = window.speechSynthesis.getVoices();
    speakerMessage.voice = voices[2];

    //Prepare listeners
    mainListener.isListening = false;
    wakeUpListener.isListening = false;

    qSay(international.getGUIText('How can I help you'), function(){
      //Loop start
      startMainVoiceLoop();
    });
  };


  /*
  *
  *     function definition
  *
  */

  //wait for wake up command
  function waitForWakeup(wakeupCommand, callback) {
    if(wakeUpListener.isListening){
      wakeUpListener = new webkitSpeechRecognition();
    }
		wakeUpListener.isListening = false;
		wakeUpListener.lang = qapi.getUserLang();
		wakeUpListener.continuous = true;
		wakeUpListener.interimResults = true;
		wakeUpListener.onresult = function(event){
			if (event.results.length > 0) {
					  var result = event.results[event.results.length-1][0].transcript;
						if(result.contains(wakeupCommand)){
							wakeUpListener.abort();
              qSay('I am listening', function(){
                wakeUpListener.isListening = false;
                callback();
              });
						}
			}
		}
    wakeUpListener.onend = function(event){
      // Wakeup listener has been stoped
    }
		wakeUpListener.start();
      // Wakeup listener has been started
		wakeUpListener.isListening = true;
  }
  function speechToText(notFinal, callback){
    if(mainListener.isListening){
      mainListener = new webkitSpeechRecognition();
    }
    mainListener.interimResults = true;
    mainListener.isListening = false;
    mainListener.lang = qapi.getUserLang();
    mainListener.onresult = function(event){
      lastActionNow();
      if (event.results.length > 0) {
					var result = event.results[event.results.length-1][0].transcript;
          if (event.results.length > 0) {
              var result = event.results[event.results.length-1];
              if(result.isFinal) {
                mainListener = new webkitSpeechRecognition();
                mainListener.isListening = false;
                callback(result[0].transcript);
              }else{
                notFinal(result[0].transcript + "...");
              }
          }
			}
    }
    mainListener.start();
		mainListener.isListening = true;
  }
  var qSay = function(phrase, callback){
    speakerMessage.text = phrase;
    if(qapi.getUserLang() == "en"){
      speakerMessage.lang = "en-UK";
    }else{
      speakerMessage.lang = qapi.getUserLang();
    }
    speakerMessage.onend = function(event){
      lastActionNow();
      callback();
    };
    speakerMessage.onerror = function(er){
      console.error(er);
      callback();
    }
    if(phrase != null && phrase != ""){
      speechSynthesis.speak(speakerMessage);
    }else{
      speechSynthesis.speak(international.getGUIText("I don`t know what to say"));
    }
  }
  global.qSay = qSay;

  function lastActionNow(){
    var d = new Date();
    var n = d.getTime();
    lastActionHappened = n;
  }

  //Time executions
  window.setInterval(function(){
    var d = new Date();
    var n = d.getTime();
    if(mainListener.isListening){
      if(lastActionHappened < (n - 9000)){
        //end listening if listening
        mainListener = new webkitSpeechRecognition();
        wakeUpListener = new webkitSpeechRecognition();
        qSay(international.getGUIText('wake me up if you need me'), function(){
          startMainVoiceLoop();
        });
      }
    }
  }, 100);
})();
