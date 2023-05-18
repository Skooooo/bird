var express = require("express");
var router = express.Router();
var multer = require('multer');
const Sighting = require('../models/sightings'); // Require the Sighting model
const fetch = require('node-fetch');
const SPARQL_URL = 'https://dbpedia.org/sparql';
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

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
router.get("/", async function (req, res) {
  try {
    // Fetch all sightings from the database
    const sightings = await Sighting.find({});
    // Render the sightings_list view with the fetched data
    res.render("bird_list", { title: "", sightings });
  } catch (error) {
    // print error message in the console
    console.error(error);
    // rendering error page with promopt
    res.status(500).send("Error retrieving sightings from the database.");
  }
});

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

router.get('/recent', async function (req, res) {

  try {
    // Fetch all sightings from the database, sorted by dateTimeSeen
    const sightings = await Sighting.find({}).sort({ dateTimeSeen: -1 });

    // Render the bird_recent view with the fetched data
    res.render("bird_recent", { title: "", sightings });
  } catch (error) {
    // print error message in the console
    console.error(error);
    // rendering error page with promopt
    res.status(500).send("Error retrieving sightings from the database.");
  }
});

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
  console.log("Request body:", req.body);

  try {
    // retrieving values from req.body
    const { identification, description, dateTimeSeen, nickname, location } =
        req.body;
    // Create a new sighting object from the request body
    const newSighting = new Sighting({
      identification,
      description,
      // Store the image path, removing the 'public' part of the path
      // Here is the image saved in base64 format
      img: imgParse(img),
      dateTimeSeen,
      nickname,
      location: {
        type: "Point",
        // Get the coordinates from the request body
        coordinates: location.coordinates,
      },
      // Set the current date and time
      datetime: new Date(),
    });

    // Save the new sighting to the database
    await newSighting.save();
    // Send a success message as the response

    res.json({ message: 'Success' });

  } catch (error) {
    // Log any errors to the console
    console.error(error);
    // Send an error message as the response, with a status code of 500
    res.status(500).send("Error saving sighting to the database.");
  }
});

// Bird details/dbpedia
router.get("/sighting/:id", async function (req, res, next) {
  try {

    // retrieving sightingId from request params
    const sightingId = req.params.id;
    // searching entry from the database by id
    const sighting = await Sighting.findById(sightingId);
    if (sighting) {
      // transform bird speci name to html encode name
      const birdName = encodeURIComponent(sighting.identification);
      // dbpedia query
      const query = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        SELECT ?label ?description ?uri WHERE {
            ?uri a dbo:Bird .
            ?uri dbo:abstract ?description ;
                rdfs:label ?label .
            ?uri foaf:isPrimaryTopicOf ?wikiPage .
            FILTER (LANG(?label) = 'en' && LANG(?description) = 'en' && STRSTARTS(LCASE(?label), "${birdName.toLowerCase()}"))
           }
           LIMIT 1
            `;
      // retrieving data ftom dbpedia url as json format
      const url = `${SPARQL_URL}?query=${encodeURIComponent(
          query
      )}&format=json`;
      // retrieving data from dbpedia
      const response = await fetch(url);
      // retrieving data from response
      const data = await response.json();
      // determine if it has the entry
      if (data.results.bindings.length > 0) {
        // retrieving from bindings index 0
        const birdInfo = data.results.bindings[0];
        // creating an object base on the information from dbpedia
        sighting.birdInfo = {
          name: birdInfo.label.value,
          description: birdInfo.description.value,
          uri: birdInfo.uri.value,
        };
      }
      // render page baseon the object just created
      res.render("bird_details", { title: "", sighting: sighting });
    } else {
      // if the entry does not exist in the database
      // render the page of 404 with prompt
      res.status(404).send("Sighting not found");
    }
  } catch (err) {
    // if error detected, render 500 page with prompt
    res.status(500).send(`Error: ${err.message}`);
  }
});


//update identification
router.get("/sighting/:id/update", async function (req, res, next) {
  try {
    // retrieving sightingId from request params
    const sightingId = req.params.id;
    // searching entry from the database by id
    const sighting = await Sighting.findById(sightingId);
    // if the sighting entry exists
    if (sighting) {
      // render the page of update with the entry that just found
      res.render("update", { title: "Update a sighting", sighting: sighting });
    } else {
      // if the entry does not exist in the database
      // render the page of 404 with prompt
      res.status(404).send("Sighting not found");
    }
  } catch (err) {
    // if error detected, render 500 page with prompt
    res.status(500).send(`Error: ${err.message}`);
  }
});

//post identification
router.post("/sighting/:id/update", async function (req, res) {
  try {

    const sightingId = req.params.id;

    // Fetch the sighting from the database
    const sighting = await Sighting.findById(sightingId);

    if (sighting) {
      // Check if the ID matches the original poster's ID
      if (sighting.posterId === posterId) {
        // Update the sighting
        sighting.identification = newIdentification;
        await sighting.save();
        res.json(sighting);
      } else {
        // if the entry id does not match
        // render the page of 403 with prompt
        res.status(403).send("Unauthorized to update this sighting");
      }
    } else {
      // if the entry does not exist in the database
      // render the page of 404 with prompt
      res.status(404).send("Sighting not found");
    }
  } catch (err) {
    // if error detected, render 500 page with prompt
    res.status(500).send(`Error: ${err.message}`);
  }
});

// // Parse JSON bodies
// router.use(bodyParser.json());

// post messages
router.post('/message', async function(req, res)  {
  console.log('Request body:', req.body);

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
