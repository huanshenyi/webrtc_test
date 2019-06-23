"use scrict"
var http = require("http");
var https = require("https");
var fs = require("fs");

var express = require("express");
var serveIndex = require('serve-index');

//socket.Ioをrequire
var socketIo = require('socket.io');
//log
var log4js = require('log4js')
//log_config
log4js.configure({
    appenders:{
        file:{
            type: 'file',
            filename: 'app.log',
            layout: {
                type: 'pattern',
                pattern: '%r %p - %m',
            }
        }
    },
    categories: {
        default: {
            appenders:['file'],
            level: 'debug'
        }
    }
});
var logger = log4js.getLogger();

var app = express();
app.use(serveIndex("./public"));
app.use(express.static('./public'))

//http server
var http_server = http.createServer(app);

//サーバーとsocket.ioをリンクする
var io = socketIo.listen(http_server);
io.on('connection',(socket)=>{
    //ルームにjoin
   socket.on('join',(room)=>{
      socket.join(room);
      var myRoom = io.adapter.rooms[room];
      var users = Object.keys(myRoom.sockets).length;
      logger.log('the number of user in room is:'+users);
      //socket.emit('joined',room,socket.id);
      //socket.to(room).emit('joined',room,socket.id); //room内に自分以外すべての人にメッセージ
      //io.in(room).emit('joined',room,socket.id); //room内にすべての人にメッセージ
      socket.broadcast.emit('joined',room,socket.id); //自分以外全ての人にメッセージ
   });

    //ルームから離れる
    socket.on('leave',(room)=>{
        var myRoom = io.adapter.rooms[room];
        var users = Object.keys(myRoom.sockets).length;
        // users - 1;
        logger.log('the number of user in room is:'+(users-1));
        socket.leave(room);
        //socket.emit('joined',room,socket.id);
        //socket.to(room).emit('joined',room,socket.id); //room内に自分以外すべての人にメッセージ
        //io.in(room).emit('joined',room,socket.id); //room内にすべての人にメッセージ
        socket.broadcast.emit('joined',room,socket.id); //自分以外全ての人にメッセージ
     });
});
http_server.listen(8080,'0.0.0.0');

var options = {
    // key : fs.readFileSync("keypath"),
    // cert : fs.readFileSync("certpath"),
}

//httpsserver
var https_server = https.createServer(options, app);
https_server.listen(433,'0.0.0.0');
