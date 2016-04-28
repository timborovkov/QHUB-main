(function(){
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
  //MiLight & EasyBulb
  var Milight = require("milight");

  module.exports.performHomeAutomation = function(action, parameters, callback){
    //TODO
    callback();
  }

  module.exports.devices = {
    "hue": function(action, device){
      Cylon.robot({
        connections: {
          hue: { adaptor: 'hue', host: '192.168.1.85', username: 'XXX' }
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
    "easybulb": function(action, adjustments, d){
      var groupId = d.group || 1;

      var milight = new Milight({
          host: d.ip,
          broadcast: true
      });

      switch (action) {
        case 'on':
            // All zones on
            milight.zone(groupId).on();
            res.send('{done: true}');
          break;
        case 'off':
            // All zones on
            milight.zone(groupId).off();
            res.send('{done: true}');
          break;
        case 'color':
            milight.zone(groupId).rgb(adjustments.color);
            res.send('{done: true}');
          break;
        case 'white':
            milight.zone(groupId).white(adjustments.brightness);
            res.send('{done: true}');
          break;
        default:
            res.send('{done: false}');
      }
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

  $("document").ready(function(){
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
})();
