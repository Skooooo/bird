var express = require("express");
var router = express.Router();
var multer = require('multer');
const Sighting = require('../models/sightings'); // Require the Sighting model
const fetch = require('node-fetch');
const SPARQL_URL = 'https://dbpedia.org/sparql';
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
var controllers = require('../controllers/sightings');


// Configure multer storage options
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  // 图片名字
  filename: function (req, file, cb) {
    // Get the original image name, i.e. what the image was called when the user uploaded it
    var original = file.originalname;
    // Get the most original file name and cut the file name with "." Cut
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    // Saved file name going on present timestamp + '.' + original file name in '.' Cut the array to the first bit of file_extension.length - 1
    // eg: original = cute_bird.jpg -> file_extension = ['cute_bird', 'jpg']
    filename = Date.now() + "." + file_extension[file_extension.length - 1];
    cb(null, filename);
  },
});

// Set the instance object for the upload, which is used to call the storage object to save the image
var upload = multer({ storage: storage });

// Bird list route
router.get('/', controllers.getSightings);


router.get('/nearby', async function (req, res) {
  try {
    // Fetch all sightings from the database, sorted by dateTimeSeen
    const sightings = await Sighting.find({});
    
    // Render the bird_recent view with the fetched data
    res.render('bird_nearby', { title: '', sightings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving sightings from the database.');
  }
});

// Recent bird route

router.get('/recent', controllers.getRecentSightings);

router.get("/add_bird", function (req, res) {
  res.render("add_bird", { title: "Enter a sighting information" });
});

// Add bird route
router.get("/add", function (req, res) {
  // adding from to the database
  res.render("add", { title: "Add a new Sighting to the DB" });
});


/**
 *
 * @param {*} file img file
 * @returns img files in base 64 format
 */
const imgParse = (file) => {
  const filePath = path.resolve(file); // Address of original document
  const fileMimeType = mime.getType(filePath); // Get the memeType of the file

  // Exit if it is not an image file
  if (!fileMimeType?.toString()?.includes("image") ?? true) {
    console.log(`Failed! ${filePath}:\tNot image file!`);
    return;
  }

  // Read file data
  let data = fs.readFileSync(filePath);
  data = Buffer.from(data).toString("base64");
  return data;
};

// Define a route for POST requests to '/add'
router.post("/add", upload.single("myImg"), async function (req, res) {
  // Log the request body to the console
  console.log('Request body:', req.body);

  try {
    // Create a new sighting object from the request body
    const newSighting = new Sighting({
      identification: req.body.identification,
      description: req.body.description,
      // Store the image path, removing the 'public' part of the path
      img: req.file.path.replace('public', ''),
      dateTimeSeen: req.body.dateTimeSeen,
      nickname: req.body.nickname,
      location: {
        type: 'Point',
        // Get the coordinates from the request body
        coordinates: req.body.location.coordinates
      },
      // Set the current date and time
      datetime: new Date(),
    });

    // Save the new sighting to the database
    await newSighting.save();
    // Send a success message as the response
    res.json({message: 'Success'});
  } catch (error) {
    // Log any errors to the console
    console.error(error);
    // Send an error message as the response, with a status code of 500
    res.status(500).send('Error saving sighting to the database.');
  }
});

// Bird details/dbpedia
router.get('/sighting/:id', controllers.getSightingDetails);


//update identification
router.get('/sighting/:id/update', controllers.showUpdateForm);



//post identification
router.post('/sighting/:id/update', controllers.updateSighting);

// // Parse JSON bodies
// router.use(bodyParser.json());

// post messages
router.post('/message', async function(req, res)  {

  console.log("%%%%%%%%%%%%%%%%%%%%%");

  console.log('Request body:', req.body);
  // try{
  //   const sightingId = req.body.id;
  //   const message = req.body.message;
  //   const sighting = await Sighting.findById(sightingId);
  //
  //   if(sighting){
  //     console.log("^^^^^^^^^^^^^^^^^^");
  //     sighting.comments.add(message);
  //     // const arr =
  //     // sighting.comments = message;
  //     await sighting.save();
  //     res.json(sighting);
  //
  //   }else {
  //     res.status(404).send('Sighting not found');
  //   }
  // } catch (err) {
  //   res.status(500).send(`Error: ${err.message}`);
  // }

  // const convertedObjectId = mongoose.Types.ObjectId(req.body.id);
  const convertedObjectId = new ObjectId(req.body.id);
  console.log("objectId: ", convertedObjectId);
  const comment = {text: req.body.message};
  Sighting.updateOne(
      { _id: convertedObjectId },
      { $push: { comments:  comment} }
  )
      .then(() => {
        console.log('Array updated successfully');
      })
      .catch((error) => {
        console.error('Error updating array:', error);
      });
});


//get knowledge graph
router.get('/sighting/:id', function (req, res, next) {

  // Fetch the sighting from your database...
  // Then fetch the bird information from DBpedia:
  const resource = `http://dbpedia.org/resource/${sighting.identification}`;
  const endpointUrl = "https://dbpedia.org/sparql";
  const sparqlQuery = `
        SELECT ?label ?scientificName ?abstract ?uri WHERE {
            <${resource}> rdfs:label ?label .
            <${resource}> dbo:abstract ?abstract .
            <${resource}> dbo:scientificName ?scientificName .
            BIND(IRI(?abstract) AS ?uri)
            FILTER (langMatches(lang(?label),"EN"))
            FILTER (langMatches(lang(?abstract),"EN"))
        }`;
  const urlEncodedQuery = encodeURIComponent(sparqlQuery);
  const url = `${endpointUrl}?query=${urlEncodedQuery}&format=json`;

  // retrieving data from dbpedia
  // if the data returned, render the page sighting
  fetch(url)

    .then(response => response.json())
    .then(data => {
      // Extract the bird information from the data...
      const bird = data.results.bindings[0];
      res.render('sighting', {
        title: 'Sighting',
        sighting: sighting,
        bird: bird


      });
    });
});





module.exports = router;
