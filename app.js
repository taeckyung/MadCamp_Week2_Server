// app.js

// [LOAD PACKAGES]
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/madcamp_week2');

// DEFINE MODEL
var Contact = require('./models/contact');

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// [CONFIGURE SERVER PORT]
var port = 80;

// [CONFIGURE ROUTER]
var router = require('./routes')(app, Contact);

// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port)
});