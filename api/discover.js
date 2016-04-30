(function(){
  var http = require('http');
  var getmac = require('getmac')
  var browser = require('iotdb-arp');
  var request = require('request');

  module.exports.devices = function(callback){
    //Search for iot devices in local network
    //Philips Hue, Osram Lightify, EasyBulb, Belkin WeMo, Nest...
    //Need to return: [{"id": 1, "type": "lamp/socket", "is":"hue/lightify/easybulb/wemo", "ip":"192.168.1.x"}]
    var last_found = Date.now();
    var devices = {};

    startSearch(function(d){
      //Set last time discovered a new device, to now
      last_found = Date.now();
      //TODO: get devices id from the server or register new

      //Create new device
      var newDevice = {"type": d.type, "is": d.name, "ip": d.ip};
      //add found device to devices
      devices[id] = newDevice;
    });

    var interval1 = setInterval(function() {
      if(last_found < Date.now() - 20000){
        //Ended search
        callback(devices);
        clearInterval(interval1);
      }else{
        //Still searching
      }
    }, 1000);
  };

  function startSearch(callback){
    var devices = [[]];
    var last_found = Date.now();
    browser.browser({}, function(error, d){
        if (error) {
            console.error(error);
        } else if (d) {
          last_found = Date.now();
          //console.log("ip: "+d.ip + " mac: "+d.mac);
          devices.push(d);
        }
    });
    var interval2 = setInterval(function() {
      if(last_found < Date.now() - 20000){
        //Ended search
        console.log("Ended");
        searchInMacs(devices,  callback);
        clearInterval(interval2);
      }else{
        //Still searching
      }
    }, 5000);
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

              callback({"ip": d.ip, "name": "easybulb", "type": "lamp"});
            }else if (false) { //TODO
              //WeMo
              callback({"ip": d.ip, "name": "wemo", "type": "lamp"});
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
