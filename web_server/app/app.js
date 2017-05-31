var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();

var http = require('http').Server(app);

app.use(bodyParser.urlencoded({extended: true, limit: '300mb'}));
app.use(bodyParser.json({limit: '300mb'}));

mongodb = {};
var mongo = require('mongodb').MongoClient;
mongo.connect('mongodb://MatchaUser:matcha42@46.101.7.5:4202/Matcha', function (error, db) {
    if (error) {console.log('Cant find the mongo db, create it first');}
    else mongodb = db;
});

http.listen(3042);

require('./router.js')(router, app);
app.use('/', router);

app.listen(4201);