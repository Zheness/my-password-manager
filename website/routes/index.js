var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.user_id) {
		if (res.locals.user_infos.status == req.user_status.mustCreateMainPassword.value) {
			req.flash("warning", "You must set your main password to use this app");
			return res.redirect("/user/sign-up-step-2");
		}
	} else {
		return res.render('index', {
			title: 'Home'
		});
	}
	res.render('index', {
		title: 'Home'
	});
});

router.get('/unlock', function(req, res, next) {
	if (req.session.user_id) {
		if (res.locals.user_infos.status == req.user_status.mustCreateMainPassword.value) {
			req.flash("warning", "You must set your main password to use this app");
			return res.redirect("/user/sign-up-step-2");
		}
	} else {
		req.flash("danger", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	res.render('unlock', {
		title: 'Unlock'
	});
});

router.post('/unlock', function(req, res, next) {
	if (req.session.user_id) {
		if (res.locals.user_infos.status == req.user_status.mustCreateMainPassword.value) {
			req.flash("warning", "You must set your main password to use this app");
			return res.redirect("/user/sign-up-step-2");
		}
	} else {
		req.flash("danger", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}

	var userPassword = req.body.password;
	req.models.User.findOne({
		_id: req.session.user_id
	}, function(err, user) {
		if (err) return console.error(err);
		try {
			var pv_key = CryptoJS.AES.decrypt(user.main_password.toString(), req.body.password).toString(CryptoJS.enc.Utf8);
			var is_unlocked = CryptoJS.AES.decrypt(user.unlocked_token.toString(), pv_key).toString(CryptoJS.enc.Utf8);
		} catch (ex) {
			var pv_key = "null";
			var is_unlocked = "no";
		}

		if (is_unlocked == "unlocked") {
			var generatePassword = require("password-maker");

			// Session tmp private key, used for cookies
			var tmp_private_key = generatePassword(32);
			user.tmp_pk = tmp_private_key;
			user.dateLastAction = Date.now();
			user.save(function(err) {
				if (err) return console.error(err);
				req.session.password = CryptoJS.AES.encrypt(pv_key.toString(), tmp_private_key).toString(CryptoJS.enc.Utf8);
				req.flash("success", "The app is now unlocked");
				res.redirect("/");
			});
		} else {
			req.flash("danger", "The main password is wrong");
			res.render('unlock', {
				title: 'Unlock'
			});
		}
	});

});

module.exports = router;