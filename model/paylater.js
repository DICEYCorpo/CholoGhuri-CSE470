const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PayLater = new Schema({
    username: String,
    from: String,
    to: String,
    guests: Number,
    departure: Date,
    arrival: Date,
    hotel: String,
    transport: String,
    volunteer: String,
    paid: Boolean,
    hotelprice: Number,
    transportprice: Number,
    volunteerprice: Number,
    total: Number,
    fetchguest: Number
});

module.exports = mongoose.model('pay', PayLater)