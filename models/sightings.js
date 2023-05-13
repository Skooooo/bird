var mongoose = require('mongoose');

var Schema = mongoose.Schema;


const commentSchema = new Schema({
    nickname: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

var SightingSchema = new Schema(
    {
        dateTimeSeen: { type: Date, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        posterId: String,
        description: { type: String, required: true },
        identification: { type: String, default: 'Unknown' },
        dbpediaURI: String,
        img: {type: String },
        nickname: { type: String, required: true },
        comments: [commentSchema]
    }
);


SightingSchema.set('toObject', {getters: true, virtuals: true});

SightingSchema.index({ location: '2dsphere' });


// the schema is useless so far
// we need to create a model using it
var Sighting = mongoose.model('Sighting', SightingSchema);

// make this available to our users in our Node applications
module.exports = Sighting;