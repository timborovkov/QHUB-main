(function(){
  var nmap = require('node-libnmap')
  , opts = {
      range: [
        'scanme.nmap.org',
        '10.0.2.0/25',
        '192.168.10.80-120',
        'fe80::42:acff:fe11:fd4e/64'
      ]
    };

  nmap.scan(opts, function(err, report) {
    if (err) throw new Error(err);

    for (var item in report) {
      console.log(JSON.stringify(report[item]));
    }
  });
})();
