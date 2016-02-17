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

router.get('/info', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_settings_info;

	req.models.User.findOne({
		_id: req.session.user_id
	}, function(err, user) {
		if (err) return console.error(err);
		form = form.bind({
			first_name: user.first_name,
			last_name: user.last_name
		});

		res.render('user/settings-info', {
			title: 'Edit your infos',
			myForm: form,
			uikitFieldHorizontal: forms.uikitFieldHorizontal
		});
	});
});

router.post('/info', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("warning", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	}
	var form = forms.form_settings_info;

	form.handle(req, {
		success: function(form) {
			req.models.User.findOne({
				_id: req.session.user_id
			}, function(err, user) {
				if (err) return console.error(err);
				user.first_name = form.data.first_name;
				user.last_name = form.data.last_name;
				res.locals.user_infos.first_name = user.first_name;
				user.save(function(err) {
					if (err) return console.error(err);
					req.flash("success", "Your information has been saved");
					return reloadPage(res, form, "Edit your infos", "user/settings-info");
				});
			});
		},
		error: function(form) {
			req.flash("danger", "The form contains errors");
			return reloadPage(res, form, "Edit your infos", "user/settings-info");
		},
		empty: function(form) {
			return reloadPage(res, form, "Edit your infos", "user/settings-info");
		}
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