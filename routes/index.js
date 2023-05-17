var express = require('express');
var router = express.Router();
var controllers = require('../controllers/sightings');

// Bird list route
router.get('/', controllers.getSightings);

// Recent bird route
router.get('/recent', controllers.getRecentSightings);

router.get('/add_bird', controllers.showAddBirdForm);

// Add bird route
router.get('/add', controllers.showAddForm);

// Define a route for POST requests to '/add'
router.post('/add', controllers.addSighting);

// Bird details/dbpedia
router.get('/sighting/:id', controllers.getSightingDetails);

//update identification
router.get('/sighting/:id/update', controllers.showUpdateForm);

//post identification
router.post('/sighting/:id/update', controllers.updateSighting);

//get knowledge graph
router.get('/sighting/:id', controllers.getSightingKnowledgeGraph);

module.exports = router;
