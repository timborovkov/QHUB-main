(function(){
  var http = require('http');
  var getmac = require('getmac')
  var browser = require('iotdb-arp');
  var request = require('request');

  module.exports.devices = function(callback){
    //Search for iot devices in local network
    //Philips Hue, Osram Lightify, EasyBulb, Belkin WeMo
    //Need to return: {"id": {"type": "lamp/socket", "is":"hue/lightify/easybulb/wemo", "ip":"192.168.1.x"}}
    var last_found = Date.now();
    var devices = [{}];

    startSearch(function(d){
      //Set last time discovered a new device, to now
      last_found = Date.now();

      //Create new device var
      var newDevice = {"name": d.name, "type": d.type, "connectionType": d.connectionType,"ip": d.ip};

      if(devices[0] == {}){
        devices[0] = newDevice;
      }else{
        //add found device to devices
        var index = device.length;
        devices[index] = newDevice;
      }
    });

    var interval = setInterval(function() {
      if(last_found < Date.now() - 10000){
        //Ended search
        callback(devices);
        clearInterval(interval);
      }else{
        //Still searching
      }
    }, 1000);
  };

  function startSearch(callback){
    var devices = {};
    var last_found = Date.now();
    browser.browser({}, function(error, d){
        if (error) {
            console.error(error);
        } else if (d){
          last_found = Date.now();
          var index = devices.length;
          devices[index] = d;
        }
    });
    var intervalMAC = setInterval(function() {
      if(last_found < Date.now() - 15000){
        //Ended search
        console.log("Ended");
        searchInMacs(devices, callback);
        clearInterval(intervalMAC);
      }else{
        //Still searching
      }
    }, 1000);
  }
  function searchInMacs(d, callback){
    for (var i = 1; i < d.length; i++){
      if(d[i].mac != null && d[i].ip != null){
        getVendor(d[i].mac, d[i].ip, function(vendor, d){
          if (vendor != null) {
            if (vendor.indexOf("Hi-flying electronics") >= 0){
              //easybulb
              console.log("EasyBulb found");
              console.log("Ip: " + d.ip);
              console.log("Mac: " + d.mac);
              console.log("Vendor" + vendor);

              callback({"ip": d.ip, "name": "EasyBulb", "description": "This is EasyBulb lamp", "type": "lamp", "connectionType": "easybulb"});
            }else if (false) { //TODO
              //WeMo
              callback({"ip": d.ip, "name": "WeMo", "description": "This is WeMo" "type": "lamp", "connectionType": "wemo"});
            }else{
              //Something else
            }
          }else{
            //Error
          }
          if (i == d.length -1) {
            console.log("DONE");
          }
        });
      }else{
        console.log("Null");
      }
    }
  }
  function getVendor(mac, ip, callback){
    request('http://www.macvendorlookup.com/api/v2/'+mac, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        var vendor = result[0].company;
        callback(vendor, {"ip": ip, "mac": mac});
      }else{
        callback(null, {"ip": ip, "mac": mac});
      }
    })
  }
})();
