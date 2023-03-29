const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CholoGhuriPackage = new Schema({
    place: String,
    packagePrice: Number,

});

module.exports = mongoose.model('Chologhuripackage', CholoGhuriPackage)