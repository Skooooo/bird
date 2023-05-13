var bodyParser = require("body-parser");
var req = require('request');
var Sighting = require('../models/sightings');
var path = require('path');


exports.create = async function (req, res) {
    userData = req.body;

    var sighting = new Sighting({
        dateTimeSeen: userData.dateTimeSeen,
        location: {
            type: userData.location.type,
            coordinates: [
                userData.location.coordinates[0],
                userData.location.coordinates[1],
            ],
        },
        posterId: userData.posterId,
        description: userData.description,
        identification: userData.identification,
        dbpediaURI: userData.dbpediaURI,
        img: path.join('uploads', req.file.filename),
        nickname: userData.nickname,
        comments: [],
    });


    try {

        const results = await sighting.save();

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(sighting));
    } catch (err) {
        res.status(500).send(`Invalid data! Error: ${err.message}`);

    };


};






