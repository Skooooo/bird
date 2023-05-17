var multer = require('multer');
var Sighting = require('../models/sightings');
var fetch = require('node-fetch');
const SPARQL_URL = 'https://dbpedia.org/sparql';

// Configure multer storage options
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        filename = Date.now() + '.' + file_extension[file_extension.length - 1];
        cb(null, filename);
    },
});

var upload = multer({ storage: storage });

exports.getSightings = async function (req, res) {
    try {
        // Fetch all sightings from the database
        const sightings = await Sighting.find({});

        // Render the sightings_list view with the fetched data
        res.render('bird_list', { title: '', sightings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving sightings from the database.');
    }
};

exports.getRecentSightings = async function(req, res) {
    try {
        // Fetch all sightings from the database, sorted by dateTimeSeen
        const sightings = await Sighting.find({}).sort({dateTimeSeen: -1});

        // Render the bird_recent view with the fetched data
        res.render('bird_recent', { title: '', sightings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving sightings from the database.');
    }
};

exports.showAddBirdForm = function (req, res) {
    res.render('add_bird', { title: 'Enter a sighting information' });
};

exports.showAddForm = function (req, res) {
    res.render('add', { title: 'Add a new Sighting to the DB' });
};

exports.addSighting = upload.single('myImg'), async function (req, res) {
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
};

exports.getSightingDetails = async function (req, res, next) {
    try {
        const sightingId = req.params.id;
        const sighting = await Sighting.findById(sightingId);
        if (sighting) {
            const birdName = encodeURIComponent(sighting.identification);
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
            const url = `${SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.results.bindings.length > 0) {
                const birdInfo = data.results.bindings[0];
                sighting.birdInfo = {
                    name: birdInfo.label.value,
                    description: birdInfo.description.value,
                    uri: birdInfo.uri.value
                };
            }

            res.render('bird_details', { title: '', sighting: sighting });
        } else {
            res.status(404).send('Sighting not found');
        }
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
};

exports.showUpdateForm = async function (req, res, next) {
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
};

exports.updateSighting = async function (req, res) {
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
};

exports.getSightingKnowledgeGraph = function(req, res, next) {
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
};
