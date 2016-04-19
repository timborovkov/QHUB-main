//http://cylonjs.com
var Cylon = require('cylon');
//https://cylonjs.com/documentation/platforms/hue/
var hue = require('cylon-hue');
//https://www.npmjs.com/package/cylon-ble
var ble = require('cylon-ble');
//
var nest = require('cylon-nest');
//https://www.npmjs.com/package/wemo-client
var Wemo = require('wemo-client');
var wemo = new Wemo();
//
var easyBulb = require('limitless-gem');


function performHomeAutomation(action, parameters, callback){
  if(action.contains('home')){
    //TODO
    alert(action);
    callback();
  }else{
    callback();
  }
}

var devices = {
  "hue": function(action, device){
    Cylon.robot({
      connections: {
        hue: { adaptor: 'hue', host: '192.168.1.85', username: 'XXX' } //TODO where to get IP?
      },

      devices: {
        bulb: { driver: 'hue-light', lightId: 2 }
      },

      work: function(my) {
        every((1).second(), function() {
          my.bulb.toggle();
        });
      }
    }).start();
  },
  "easybulb": function(action, device){
    var con = easyBulb.createSocket({ host: '192.168.1.105' }); //TODO where to get IP?
    /*
    Commands
          easyBulb.RGBW.ALL_OFF
          easyBulb.RGBW.ALL_ON
          easyBulb.RGBW.SET_COLOR_TO_VIOLET
          easyBulb.RGBW.SET_COLOR_TO_ROYAL_MINT
          easyBulb.RGBW.SET_COLOR_TO_YELLOW
          easyBulb.RGBW.SET_COLOR_TO_PINK
          easyBulb.RGBW.ALL_SET_TO_WHITE
    all commands https://github.com/gembly/LimitlessGEM/tree/master/lib/commands
    */
    // con.send(cmd);
  },
  "wemo": function(action, device){
    wemo.discover(function(deviceInfo) {
      console.log('Wemo Device Found: %j', deviceInfo);

      // Get the client for the found device
      var client = wemo.client(deviceInfo);

      // Handle BinaryState events
      client.on('binaryState', function(value) {
        console.log('Binary State changed to: %s', value);
      });

      // Turn the switch on
      client.setBinaryState(1);
    });
  },
  "nest": function(action, device){

  },
  "ble": function(action, device){

  }
}

$("document").load(function(){
  //TODO discover IoT devices in the same network
  Cylon.api('http');
});

window.setInterval(function(){

  //Ask server if there is a task for this hub
  //Convert task to standart
  //on, off, dim, bright, color
  //Perform task
  //Tell server about it

}, 100);
