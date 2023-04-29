const mongoose = require('mongoose')
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserCreds = new Schema({
    name: String,
    username: String,
    email: String,
    phone: String,
    pass:  String,
    Confirmpass: String,
    age: String,
    category: String,
    gender: String

});
UserCreds.plugin(passportLocalMongoose, {usernameField: 'email'});
module.exports = mongoose.model('Usercred', UserCreds)