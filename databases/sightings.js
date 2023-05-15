// Include the mongoose library to interact with MongoDB
var mongoose = require('mongoose');

// MongoDB URL to connect to
var mongoDB = 'mongodb+srv://Team6:Team6@cluster0.7ydimha.mongodb.net/sightings?retryWrites=true&w=majority'; // New URL for the "sightings" database

// Set mongoose to use global Promise library
mongoose.Promise = global.Promise;

// Connect mongoose to the MongoDB database
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the connection object for the database
var db = mongoose.connection;

// Bind the 'error' event to console.error so errors are printed to console
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/*
More general way to establish connection:
This method allows for multiple connections, and provides more detailed error info

try {
    // Attempt to create a new connection to the MongoDB database
    var connection = mongoose.createConnection(mongoDB);
    console.log("connection to mongodb worked!");  // Log success message
} catch (e) {
    // Log any errors that occur during the connection
    console.log('error in db connection: ' +e.message)
}
*/
