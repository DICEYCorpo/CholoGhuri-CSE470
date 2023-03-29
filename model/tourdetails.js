const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TourDetails = new Schema({
    _id: String,
    from: String,
    to: String,
    guests: Number,
    departure: Date,
    arrival: Date,
    hotel: String,
    transport: String,
    volunteer: String
})

module.exports = mongoose.model('tourdetail', TourDetails)