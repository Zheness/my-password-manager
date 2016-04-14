var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
var forms = require("../forms");
var strength = require('strength');

function reloadPage(res, form, title, layout) {
	return res.render(layout, {
		title: title,
		myForm: form,
		uikitFieldHorizontal: forms.uikitFieldHorizontal,
		extraCSS: [
			"/uikit/css/components/progress.almost-flat.min.css",
		],
		extraJS: [
			"/password-generator.min.js",
			"/javascripts/password-strength.js",
			"/javascripts/add-item.js",
		]
	});
}

router.get('/', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}

	return res.render("item/index", {
		title: "Home",
		extraCSS: [
			"/stylesheets/style.css",
			"/uikit/css/components/notify.almost-flat.min.css",
			"/uikit/css/components/progress.almost-flat.min.css",
		],
		extraJS: [
			"/uikit/js/components/notify.min.js",
			"/uikit/js/components/grid.min.js",
			"/clipboard/clipboard.min.js",
			"/angular/angular.min.js",
			"/javascripts/items.js",
		]
	});
});

router.get('/add', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_add_item;

	return reloadPage(res, form, "Add an item", "item/add");
});

router.post('/add', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_add_item;
	console.log("1");

	form.handle(req, {
		success: function(form) {
				console.log("1b");
			req.models.User.findOne({
				_id: req.session.user_id
			}, function(err, user) {
				console.log("2");
				if (err) return console.error(err);
				console.log("3");
				var pwd_hidden = "";
				var max_length = form.data.password.length;
				for (var i = 0; i < max_length; i++) {
					pwd_hidden += "*";
				};
				console.log("4");

				var pv_key = CryptoJS.AES.decrypt(req.session.password, user.tmp_pk).toString(CryptoJS.enc.Utf8);
				var is_unlocked = CryptoJS.AES.decrypt(user.unlocked_token, pv_key).toString(CryptoJS.enc.Utf8);

				if (is_unlocked != "unlocked") {
					req.flash("danger", "Your current main password is incorrect");
					return reloadPage(res, form, "Add an item", "item/add");
				}
				console.log("5");

				var new_item = req.models.Item({
					title: form.data.title,
					url: form.data.url,
					username: form.data.username,
					password: CryptoJS.AES.encrypt(form.data.password, pv_key),
					password_hidden: pwd_hidden,
					password_strength: strength(form.data.password) * 100,
					comment: form.data.comment,
					category_id: form.data.category,
					user_id: req.session.user_id,
				});
				console.log("6");

				new_item.save(function(err) {
					console.log("7");
					if (err) return console.error(err);
					form = forms.form_add_item;
					req.flash("success", "The new item has been saved");
					return reloadPage(res, form, "Add an item", "item/add");
				});
			});
		},
		error: function(form) {
			console.log("8");
			req.flash("danger", "The form contains errors");
			return reloadPage(res, form, "Add an item", "item/add");
		},
		empty: function(form) {
			console.log("9");
			return reloadPage(res, form, "Add an item", "item/add");
		}
	});
});

module.exports = router;