// Include the mongoose library to interact with MongoDB
var mongoose = require('mongoose');

// Get the Schema constructor from mongoose
var Schema = mongoose.Schema;

// Define a new schema for comments
const commentSchema = new Schema({
    nickname: { type: String, required: true },  // Nickname of the commenter
    text: { type: String, required: true },  // Comment text
    createdAt: { type: Date, default: Date.now }  // Time the comment was created
});

// Define a new schema for sightings
var SightingSchema = new Schema(
    {
        dateTimeSeen: { type: Date, required: true },  // Date and time the sighting was seen
        location: {  // Location of the sighting
            type: {  // Type of the location data
                type: String,
                enum: ['Point'],  // Only 'Point' is allowed
                required: true
            },
            coordinates: {  // Coordinates of the sighting
                type: [Number],  // Array of numbers
                required: true
            }
        },
        posterId: String,  // ID of the poster
        description: { type: String, required: true },  // Description of the sighting
        identification: { type: String, default: 'Unknown' },  // Identification of the sighting, defaults to 'Unknown'
        dbpediaURI: String,  // URI for additional info
        img: { type: String },  // Path to image
        nickname: { type: String, required: true },  // Nickname of the poster
        comments: [commentSchema]  // List of comments on the sighting
    }
);

// Enable getters and virtuals when converting to Objects
SightingSchema.set('toObject', { getters: true, virtuals: true });

// Index location as a 2dsphere for geospatial queries
SightingSchema.index({ location: '2dsphere' });

// Create a model from the Sighting schema
var Sighting = mongoose.model('Sighting', SightingSchema);

// Export the Sighting model so it can be used in other parts of the application
module.exports = Sighting;
