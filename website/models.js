var mongoose = require('mongoose');

exports.User = new mongoose.Schema({
	first_name: String,
	last_name: String,
	email: String,
	password: String,
	status: Number,
	dateCreated: {
		type: Date,
		default: Date.now
	},
	main_password: String,
	unlocked_token: String,
	tmp_pk: String,
	dateLastAction: Date,
});

exports.Item = new mongoose.Schema({
	title: String,
	url: String,
	username: String,
	password: String,
	password_hidden: String,
	comment: String,
	user_id: String,
});