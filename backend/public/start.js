var express = require('express');
var app = express();
var path = require('path');

const admin = require('firebase-admin');

var serviceAccount = require('./s.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

  const settings = {/* your settings... */ timestampsInSnapshots: true};
  db.settings(settings);

// viewed at http://localhost:8080

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/summer.html'));
});


app.get('/process/:imageID', function(req, res) {
	let imageID = req.params.imageID;
	var imageRef = db.collection('images').doc(imageID);
	var getURL = imageRef.get()
    .then(doc => {
        return doc.data().URL;
    }).then(result => {
		console.log(result);
	})
    .catch(err => {
      console.log('Error getting document', err);
    });

	
	
	
});


app.listen(3000);