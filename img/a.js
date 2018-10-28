var Jimp = require('jimp');
 
// open a file called "lenna.png"
Jimp.read('webPageEditted.png', (err, lenna) => {
  if (err) throw err;
  lenna
    .resize(200, 350) // resize
    .quality(60) // set JPEG quality
    .write('webPageEditted.png'); // save
});