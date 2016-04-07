var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
var forms = require("../forms");
var strength = require('strength');

function reloadPage(res, form, title, layout) {
	return res.render(layout, {
		title: title,
		myForm: form,
		uikitFieldHorizontal: forms.uikitFieldHorizontal
	});
}

router.get('/', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	options = {
		user_id: req.session.user_id
	};
	req.models.Totp.find(options,
		"_id title",
		function(err, items) {
			return res.render("totp/index", {
				title: "List of TOTP items",
				items: items
			});
		});
});

router.get('/add', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_add_totp;

	return reloadPage(res, form, "Add an TOTP item", "totp/add");
});

router.post('/add', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_add_totp;

	form.handle(req, {
		success: function(form) {
			req.models.User.findOne({
				_id: req.session.user_id
			}, function(err, user) {
				if (err) return console.error(err);

				var new_totp = req.models.Totp({
					title: form.data.title,
					secret: form.data.secret,
					user_id: req.session.user_id,
				});

				new_totp.save(function(err) {
					if (err) return console.error(err);
					form = forms.form_add_totp;
					req.flash("success", "The new TOTP item has been saved");
					return reloadPage(res, form, "Add an TOTP item", "totp/add");
				});
			});
		},
		error: function(form) {
			req.flash("danger", "The form contains errors");
			return reloadPage(res, form, "Add an TOTP item", "totp/add");
		},
		empty: function(form) {
			return reloadPage(res, form, "Add an TOTP item", "totp/add");
		}
	});
});

module.exports = router;