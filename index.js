var app = require('app')
var BrowserWindow = require('browser-window')
var ipc = require('electron').ipcMain;
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./storage');

app.on('ready', function(){

  var win = new BrowserWindow({
     show: false,
     width: 480,
     height: 320,
     resizable: false,
     fullscreen: false,
     icon:'./pictures/anspirit.png'
   })
  win.webContents.openDevTools();
  win.loadURL('file://' + __dirname + '/start.html');
  win.show();

  win.on('closed', function() {
    app.quit();
  });

  ipc.on('appQuit', function(){
    app.quit();
  });
})
