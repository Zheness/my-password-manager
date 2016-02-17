var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
var forms = require("../forms");

router.get('/info', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_sign_in;

	res.render('user/settings-info', {
		title: 'Info',
		myForm: form,
		uikitFieldHorizontal: forms.uikitFieldHorizontal
	});
});

router.get('/password', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/email', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/main-password', function(req, res, next) {
	res.send('respond with a resource');
});

module.exports = router;