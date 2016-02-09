var mongoose = require('mongoose');

exports.User = new mongoose.Schema({
	first_name: String,
	last_name: String,
	email: String,
	password: String
});