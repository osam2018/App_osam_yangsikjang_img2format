var express = require('express');
var app = express();
var path = require('path');

const admin = require('firebase-admin');

var serviceAccount = require('../osam/s.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

  const settings = {/* your settings... */ timestampsInSnapshots: true};
  db.settings(settings);

// export GOOGLE_APPLICATION_CREDENTIALS="s.json"
function maker(fileName){
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
let headerCode=`<!DOCTYPE HTML> <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> <script src="../jquery-3.3.1.min.js"></script> <script src="../jquery.textfill.js"></script> <script src="../init.js"></script> <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ContentTools/1.2.5/content-tools.min.css"> <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/ContentTools/1.2.5/content-tools.min.js"></script> <script type="text/javascript"> window.onload=function(){ window.addEventListener('load', function () { var editor; }); editor = ContentTools.EditorApp.get(); editor.init('*[data-editable]', 'data-name'); } </script> <style> p { display: block; margin : 0; }


div{
background-color:white;
}

body {
    background-image: url("${fileName.URL}");
    background-repeat: no-repeat;
    background-color: #cccccc;
}

`;
let styleCode='';
let middleCode ='</style> <body>';
let divCode ='';
let endCode ='</body> </html>';
let detectedText = '';

// Read a local image as a text document
	
client
  .documentTextDetection(fileName.URL)
  .then(results => {
    const fullTextAnnotation = results[0].fullTextAnnotation;
    detectedText = fullTextAnnotation.text;
	
	let index = 0;
	
	
    fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        block.paragraphs.forEach(function(paragraph){
			let lineStart = paragraph.words[0].symbols[0];
			let lineEnd = paragraph.words[0].symbols[0];
			let lineText = "";
			let lineEndChanged = false;
			for (var i = 0, len = paragraph.words.length; i < len; i++) {
				for(var j = 0, len2 = paragraph.words[i].symbols.length ; j < len2 ; j++){
					if(lineEndChanged) {
						lineStart = paragraph.words[i].symbols[0];
					}
					
					if(paragraph.words[i].symbols[j].property === null) continue;
					
			  		let dBreak = paragraph.words[i].symbols[j].property.detectedBreak;
						lineText += paragraph.words[i].symbols[j].text;
					
					if(dBreak !== null && dBreak.type!='SPACE') {

						lineEnd = paragraph.words[i].symbols[j];
						lineEndChanged = true;
					} else {
						if(dBreak !== null && dBreak.type=='SPACE') lineText += " ";
						lineEndChanged = false;
						continue;
					}
				}
				
								if(lineEndChanged){ 
									
									let divVertices = [lineStart.boundingBox.vertices[0], lineEnd.boundingBox.vertices[1], lineStart.boundingBox.vertices[2], lineEnd.boundingBox.vertices[3] ];
									
									
				  index++;
			  divCode += '<div class="example-one-value" data-editable="" id = "d';
			  divCode += index;
			  divCode += '"> <p>';
			  divCode += lineText;
			  divCode += '</p> </div>';
			  
//console.log(JSON.stringify(word.symbols[0].text));				  
			  
			  
			  let divLeft = divVertices[0].x - 7;	
			  let divTop = divVertices[2].y - 23;
			  let divWidth = divVertices[1].x - divVertices[0].x + 11;
			  let divHeight = divVertices[2].y - divVertices[1].y + 8;
				  
		      styleCode = styleCode + '#d' + index + `{ width: ${divWidth}px; height: ${divHeight}px; text-align: left; padding: 0 0 0 0; margin: 0px; position:absolute; left:${divLeft}px; top:${divTop}px; }`;
          
									
									
									
									
									
									lineText = "";
								}

			}
			
		});
      });
    });
  }).then(results => {
	let code = headerCode + styleCode + middleCode + divCode + endCode;
	 let idBefore = db.collection("images").doc().id;
	let shortId = idBefore.substring(0,5);
	db.collection("formats").doc(shortId).set({
    sourceCode: code,
	uId: fileName.Uid,
	title: fileName.title,
	tags: fileName.tags,
	fullText:detectedText,
	created: require('firebase-admin').firestore.Timestamp.fromDate(new Date())
	});
})
  .catch(err => {
    console.error('ERROR:', err);
  });
}






// viewed at http://localhost:8080

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/images')));

app.get('/a', function(req, res) {
    res.sendFile(path.join(__dirname + '/ref.html'));
});
app.get('/image', function(req, res) {
    res.sendFile(path.join(__dirname + '/images.html'));
});

app.get('/process/:imageID', function(req, res) {
	console.log('someoneishereOMG');
	let imageID = req.params.imageID;
	var imageRef = db.collection('images').doc(imageID);
	var getURL = imageRef.get()
    .then(doc => {
        var docData = doc.data();
		maker(docData);
		res.send(imageID);
    })
    .catch(err => {
      console.log('Error getting document', err);
    });

});

function getSource(jsonData){
	return String(jsonData.sourceCode);
}


app.get('/format/:formatID', function(req, res) {
	let formatID = req.params.formatID;
	var formatRef = db.collection('formats').doc(formatID);
	var getCode = formatRef.get()
    .then(doc => {
		return doc.data();
    }).then(a => {return getSource(a);})
	.then(b => {
    res.send(b);

		})
    .catch(err => {
      console.log('Error getting document', err);
    });

});




app.listen(3000);