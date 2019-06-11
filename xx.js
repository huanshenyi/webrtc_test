var http = require("http")
var express = require("express")
var serverIndex = require("serve-index")

var app = express()

app.use(serverIndex("./public"))
app.use(express.static('./public'))

var http_serve = http.createServer(app)
http_serve.listen(80,'0.0.0.0')
