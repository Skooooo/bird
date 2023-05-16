// Include necessary modules
var bodyParser = require("body-parser");  // Parses JSON bodies for requests
var req = require('request');  // Library for making HTTP requests
var Sighting = require('../models/sightings');  // Import Sighting model
var path = require('path');  // Helps manipulate file paths

// Define an async function to create a new sighting
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

    };

};