var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	username: String,
	password: String,
	grind: String,
	frequency: String,
	pounds: String,
	fullName: String,
	address1: String,
	address2: String,
	city: String,
	state: String,
	zip: Number,
	date: Date,
	accessLevel: Number
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
