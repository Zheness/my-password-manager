var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
var forms = require("../forms");

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

	return res.render("item/index", {
		title: "Home",
		extraCSS: [
			"/uikit/css/components/notify.almost-flat.min.css"
		],
		extraJS: [
			"/uikit/js/components/notify.min.js",
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

	form.handle(req, {
		success: function(form) {
			req.models.User.findOne({
				_id: req.session.user_id
			}, function(err, user) {
				if (err) return console.error(err);
				var pwd_hidden = "";
				var max_length = form.data.password.length;
				for (var i = 0; i < max_length; i++) {
					pwd_hidden += "*";
				};

				var pv_key = CryptoJS.AES.decrypt(req.session.password, user.tmp_pk).toString(CryptoJS.enc.Utf8);
				var is_unlocked = CryptoJS.AES.decrypt(user.unlocked_token, pv_key).toString(CryptoJS.enc.Utf8);

				var new_item = req.models.Item({
					title: form.data.title,
					url: form.data.url,
					username: form.data.username,
					password: CryptoJS.AES.encrypt(form.data.password, pv_key),
					password_hidden: pwd_hidden,
					comment: form.data.comment,
					user_id: req.session.user_id,
				});

				new_item.save(function(err) {
					if (err) return console.error(err);
					form = forms.form_add_item;
					req.flash("success", "The new item has been saved");
					return reloadPage(res, form, "Add an item", "item/add");
				});
			});
		},
		error: function(form) {
			req.flash("danger", "The form contains errors");
			return reloadPage(res, form, "Add an item", "item/add");
		},
		empty: function(form) {
			return reloadPage(res, form, "Add an item", "item/add");
		}
	});
});

module.exports = router;