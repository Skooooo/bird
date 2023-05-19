// Include necessary modules
var bodyParser = require("body-parser");  // Parses JSON bodies for requests
var req = require('request');  // Library for making HTTP requests
var Sighting = require('../models/sightings');  // Import Sighting model
var path = require('path');
const fetch = require("node-fetch");  // Helps manipulate file paths
const SPARQL_URL = 'https://dbpedia.org/sparql';


//Define an async function to create a new sighting
exports.create = async function (req, res) {
    // Get user data from the request body
    userData = req.body;

    // Create a new Sighting object with user data
    var sighting = new Sighting({
        dateTimeSeen: userData.dateTimeSeen,  // Date and time the sighting was made
        location: {  // Location of the sighting
            type: userData.location.type,
            coordinates: [
                userData.location.coordinates[0],  // Latitude
                userData.location.coordinates[1],  // Longitude
            ],
        },
        posterId: userData.posterId,  // ID of the user who posted the sighting
        description: userData.description,  // Description of the sighting
        identification: userData.identification,  // Identification of the sighting
        dbpediaURI: userData.dbpediaURI,  // URI to more info about the sighting
        img: path.join('uploads', req.file.filename),  // Path to the uploaded image
        nickname: userData.nickname,  // Nickname of the user
        comments: [],  // Array to hold comments from chat
    });

    try {
        // Attempt to save the new Sighting object to the database
        const results = await sighting.save();

        // Set response header and send the newly created sighting as a JSON response
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(sighting));
    } catch (err) {
        // If there's an error, send a 500 status and the error message
        res.status(500).send(`Invalid data! Error: ${err.message}`);

    }
};

    exports.getSightings = async function (req, res) {
        try {
            // Fetch all sightings from the database
            const sightings = await Sighting.find({});
            // Render the sightings_list view with the fetched data
            res.render("bird_list", {title: "", sightings});
        } catch (error) {
            // print error message in the console
            console.error(error);
            // rendering error page with promopt
            res.status(500).send("Error retrieving sightings from the database.");
        }
    };

    exports.getRecentSightings = async function (req, res) {
        try {
            // Fetch all sightings from the database, sorted by dateTimeSeen
            const sightings = await Sighting.find({}).sort({dateTimeSeen: -1});

            // Render the bird_recent view with the fetched data
            res.render("bird_recent", {title: "", sightings});
        } catch (error) {
            // print error message in the console
            console.error(error);
            // rendering error page with promopt
            res.status(500).send("Error retrieving sightings from the database.");
        }
    };

    exports.getSightingDetails = async function (req, res, next) {
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
                res.render("bird_details", {title: "", sighting: sighting});
            } else {
                // if the entry does not exist in the database
                // render the page of 404 with prompt
                res.status(404).send("Sighting not found");
            }
        } catch (err) {
            // if error detected, render 500 page with prompt
            res.status(500).send(`Error: ${err.message}`);
        }
    };

    exports.showUpdateForm = async function (req, res, next) {
        try {
            // retrieving sightingId from request params
            const sightingId = req.params.id;
            // searching entry from the database by id
            const sighting = await Sighting.findById(sightingId);
            // if the sighting entry exists
            if (sighting) {
                // render the page of update with the entry that just found
                res.render("update", {title: "Update a sighting", sighting: sighting});
            } else {
                // if the entry does not exist in the database
                // render the page of 404 with prompt
                res.status(404).send("Sighting not found");
            }
        } catch (err) {
            // if error detected, render 500 page with prompt
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

                    res.redirect(`/sighting/${sightingId}`);
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

