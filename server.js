//INFO: this is the server side code.
// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8080; 				// set the port
var database = require('./config/database'); 			// load the database config
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');


var hskey = fs.readFileSync('./certs/SSLAcadia/server.key');
var hscert = fs.readFileSync('./certs/SSLAcadia/server.crt');
var options = {
    key: hskey,
    cert: hscert
};

var https = require('https');

// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

//This is the UI module.
//IMPROVEMENT: Add a static page, when the request is not matching after the base.Provide some directions there.
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
//app.listen(port);

/**
 * Create HTTP server.
 */

var server = https.createServer(options,app);
//IMPROVEMENT: on error ? on listening ?

server.listen(port, function(){
  console.log('https web server listening on port '+port);
});

//IMPROVEMENT: specify start in package JSON.
//IMPROVEMENT: start node in clustered manner.
