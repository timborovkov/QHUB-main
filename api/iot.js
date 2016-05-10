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
  //Hub's id
  var hubId = qapi.getHubId();
  //LocalStorage
  var LocalStorage = require('node-localstorage').LocalStorage;
	var localStorage = new LocalStorage('./storage');
  //connected devices
  var DEVICES = {};


  module.exports.performHomeAutomation = function(action, parameters, callback){
    processTask.smarthome({action: action, parameters: parameters});
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

    $.ajax({
      url: "http://api.anspirit.org/tasksForHub",
      data: {hub: hubId},
      type: "GET",
      dataType: "json",
      success: function(data){
        if(data.tasks.length > 0){
          //Got a task
          console.log("Got a task");
          for (var i = 0; i < data.tasks.length; i++) {
            var task = data.tasks[i];
            //Process each task
            if (task.action.contains("smarthome")) {
              //Smarthome action
              processTask.smarthome(task);
            }else if (task.action.contains("discover")) {
              //Discover action
              processTask.discover(task);
            }
          }
        }else{
          //No tasks
        }
      },
      error: function(a, er){
        console.error(er);
      }
    });

  }, 10000);

  var processTask = {
    smarthome: function(task){
      switch (task.action) {
        case "smarthome.lights_on":
          //Get device's id
          var deviceId = task.options.id;
          //Get device's connection type
          var device = getDeviceById(deviceId);
          var conType = device.connectionType;
          //Turn on TODO
          console.log("Turn "+conType+" with id "+deviceId+" on");
          break;
        case "smarthome.lights_off":
          //Get device's id
          var deviceId = task.options.id;
          //Get device's connection type
          var device = getDeviceById(deviceId);
          var conType = device.connectionType;
          //Turn off TODO
          console.log("Turn "+conType+" with id "+deviceId+" off");
          break;
      }
    },//--> smarthome task end
    discover: function(task){
      if(task.action.contains('devices')){
        //Discover devices and put them into database
        discover.devices(function(d){
          if (discovered.length > 0){
            console.log(discovered);
            DEVICES = discovered;
            //Register devices
            $.ajax({
              url: "http://api.anspirit.org/hubDevices/add",
              type: "GET",
              data: {user: qapi.getUserId(), password: qapi.getUserPassword(), hub: qapi.getHubId(), devices: DEVICES},
              dataType: "json",
              success: function(data){
                if(data.error){
                  //Error
                  console.error(data.details);
                }else{
                  //Success
                  console.log("devices added");
                }
              },
              error: function(a, er){
                console.error(er);
              }
            })
          }
        });
      }
    }//--> discover task end
  }//--> processTask array end
  function getDeviceById(id){
    for (var i = 0; i < DEVICES.length; i++) {
      if (DEVICES[i].id == id) {
        return DEVICES[i];
      }
    }
  };
})();
