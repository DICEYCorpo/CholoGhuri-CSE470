const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserCreds = new Schema({
    fname: String,
    lname: String,
    email: String,
    phone: String,
    pass:  String,
    Confirmpass: String,
    age: String,
    category: String,
    gender: String

});

module.exports = mongoose.model('Usercred', UserCreds)