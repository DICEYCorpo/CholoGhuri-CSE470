const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Pricing = new Schema({
    name: String,
    price: Number

})

module.exports = mongoose.model('pricing', Pricing)