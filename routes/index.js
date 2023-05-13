var express = require('express');
var router = express.Router();
var multer = require('multer');
const Sighting = require('../models/sightings'); // Require the Sighting model


// Configure multer storage options
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    filename = Date.now() + '.' + file_extension[file_extension.length - 1];
    cb(null, filename);
  },
});

var upload = multer({ storage: storage });

// Bird list route
router.get('/', async function (req, res) {
  try {
    // Fetch all sightings from the database
    const sightings = await Sighting.find({});

    // Render the sightings_list view with the fetched data
    res.render('bird_list', { title: '', sightings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving sightings from the database.');
  }
});

// Recent bird route
router.get('/recent', async function(req, res) {
  try {
    // Fetch all sightings from the database, sorted by dateTimeSeen
    const sightings = await Sighting.find({}).sort({dateTimeSeen: -1});

    // Render the bird_recent view with the fetched data
    res.render('bird_recent', { title: '', sightings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving sightings from the database.');
  }
});


// Add bird route
router.get('/add', function (req, res) {
  res.render('add', { title: 'Add a new Character to the DB' });
});

router.post('/add', upload.single('myImg'), async function (req, res) {
  console.log('Request body:', req.body);

  try {
    const newSighting = new Sighting({
      identification: req.body.identification,
      description: req.body.description,
      img: req.file.path.replace('public', ''),
      dateTimeSeen: req.body.dateTimeSeen,
      nickname: req.body.nickname,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates
      },
      datetime: new Date(),
    });

    await newSighting.save();
    res.json({message: 'Success'});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving sighting to the database.');
  }
});

// Bird details route
router.get('/sighting/:id', async function (req, res, next) {
  try {
    const sightingId = req.params.id;
    const sighting = await Sighting.findById(sightingId);
    if (sighting) {
      res.render('bird_details', { title: '', sighting: sighting });
    } else {
      res.status(404).send('Sighting not found');
    }
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

//update identification
router.get('/sighting/:id/update', async function (req, res, next) {
  try {
    const sightingId = req.params.id;
    const sighting = await Sighting.findById(sightingId);
    if (sighting) {
      res.render('update', { title: 'Update a sighting', sighting: sighting });
    } else {
      res.status(404).send('Sighting not found');
    }
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

//post identification
router.post('/sighting/:id/update', async function (req, res) {
  try {
    const sightingId = req.params.id;
    const newIdentification = req.body.identification;
    const posterId = req.body.posterId;

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
        res.status(403).send('Unauthorized to update this sighting');
      }
    } else {
      res.status(404).send('Sighting not found');
    }
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});


//get knowledge graph
router.get('/sighting/:id', function(req, res, next) {
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
