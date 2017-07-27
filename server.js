var http = require('http');
var path = require('path');
var express = require('express');

var admin = require("firebase-admin");
var firebase = require("firebase")

var app = express();
var options = { root: __dirname + "/"} ;
app.set('port', 9009);
app.set('case sensitive routing', false);

var DEBUG = false;

// FIREBASE SETUP
// todo - make this secure
var serviceAccount = require("./keys.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://fir-test-bbcbe.firebaseio.com/'
});

var FirebaseApp = admin.app();
var FirebaseDB  = admin.database(FirebaseApp);

var ref = FirebaseDB.ref();
ref.once("value").then(function (snapshot) {
	if (DEBUG) console.log('DB Connected!');	

	// var newVal = (Math.floor(Math.random() * 100));
	// ref.set({ sliderValue : newVal });
	// if (DEBUG) console.log('new Value ', newVal);
});




// ROUTES SETUP
app.get('/', function(req, res) {
    res.sendFile('/index.html', options, function (err) {
    	if (err) {
    		if (DEBUG) console.log(err);
    		res.send(err.status);
    	}
    });
});


app.put('/update', function (req, res) {
	var key = (Object.keys(req.query))[0],
		val = req.query[key];

	var query = req.query
	ref.set(query);

	console.log('update - key: ' + key + '; val: ' + val);
	res.send(200);
});

// Static Routes
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/img', express.static(path.join(__dirname, '/img')));



// Listen to Port
var server = app.listen(process.env.PORT || app.get('port'), function(){
    console.log("Server started on port " + server.address().port);
});