var express = require('express');
var router = express.Router();
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var widgets = forms.widgets;
var CryptoJS = require("crypto-js");

/*
 * Forms helpers
 */
var uikitFieldHorizontal = function(name, object) {
	if (!Array.isArray(object.widget.classes)) {
		object.widget.classes = [];
	}
	object.cssClasses = {
		label: ['uk-form-label']
	};

	var label = object.labelHTML(name);
	var error = object.error ? '<p class="uk-form-help-block uk-text-danger">' + object.error + '</p>' : '';

	if (object.error) {
		if (object.widget.classes.indexOf('uk-form-danger') === -1) {
			object.widget.classes.push('uk-form-danger');
		}
	} else {
		if (object.widget.classes.indexOf('uk-form-danger') !== -1) {
			object.widget.classes.pop('uk-form-danger');
		}
	}

	var widget = object.widget.toHTML(name, object);
	return '<div class="uk-form-row">' + label + '<div class="uk-form-controls">' + widget + error + '</div></div>';
};

/*
 * Forms
 */
var form_sign_up = forms.create({
	first_name: fields.string({
		required: true,
		widget: widgets.text({
			classes: ['uk-form-width-medium']
		}),
		validators: [
			validators.rangelength(2, 60)
		]
	}),
	last_name: fields.string({
		required: true,
		widget: widgets.text({
			classes: ['uk-form-width-medium']
		}),
		validators: [
			validators.rangelength(2, 60)
		]
	}),
	email: fields.email({
		required: true,
		widget: widgets.text({
			classes: ['uk-form-width-large']
		}),
	}),
	password: fields.password({
		required: true,
		widget: widgets.password({
			classes: ['uk-form-width-medium']
		}),
		validators: [
			validators.rangelength(4, 60)
		]
	}),
	confirm: fields.password({
		required: true,
		validators: [
			validators.matchField('password')
		],
		widget: widgets.password({
			classes: ['uk-form-width-medium']
		}),

	}),
}, {
	validatePastFirstError: true
});

var form_create_main_password = forms.create({
	password: fields.password({
		required: true,
		widget: widgets.password({
			classes: ['uk-form-width-large']
		}),
		validators: [
			validators.rangelength(4, 80)
		]
	}),
	confirm: fields.password({
		required: true,
		validators: [
			validators.matchField('password')
		],
		widget: widgets.password({
			classes: ['uk-form-width-large']
		}),

	}),
}, {
	validatePastFirstError: true
});

var form_sign_in = forms.create({
	email: fields.email({
		required: true,
		widget: widgets.text({
			classes: ['uk-form-width-large']
		}),
	}),
	password: fields.password({
		required: true,
		widget: widgets.password({
			classes: ['uk-form-width-medium']
		}),
		validators: [
			validators.rangelength(4, 80)
		]
	})
}, {
	validatePastFirstError: true
});

router.get('/sign-up', function(req, res, next) {
	if (req.session.user_id) {
		req.flash("warning", "You are already signed in");
		return res.redirect("/");
	}
	var form = form_sign_up;

	res.render('user/sign-up', {
		title: 'Sign up',
		myForm: form,
		uikitFieldHorizontal: uikitFieldHorizontal
	});
});

router.post('/sign-up', function(req, res, next) {
	if (req.session.user_id) {
		req.flash("warning", "You are already signed in");
		return res.redirect("/");
	}
	var form = form_sign_up;
	form.handle(req, {
		success: function(form) {
			req.models.User.findOne({
				email: form.data.email
			}, function(err, user) {
				if (err) return console.error(err);
				if (user === null) {
					var new_user = new req.models.User({
						first_name: form.data.first_name,
						last_name: form.data.last_name,
						email: form.data.email,
						password: CryptoJS.SHA1(form.data.password).toString(),
						status: req.user_status.mustCreateMainPassword.value,
						main_password: ""
					});
					new_user.save(function(err) {
						if (err) return console.error(err);
						req.session.user_id = new_user._id;
						req.flash("success", "Your account has been created");
						res.redirect("/user/sign-up-step-2");
					});
				} else {
					req.flash("danger", "This email is already used");
					res.render('user/sign-up', {
						title: 'Sign up',
						myForm: form,
						uikitFieldHorizontal: uikitFieldHorizontal
					});
				}
			})
		},
		error: function(form) {
			req.flash("danger", "The form contains errors");
			res.render('user/sign-up', {
				title: 'Sign up',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		},
		empty: function(form) {
			res.render('user/sign-up', {
				title: 'Sign up',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		}
	});
});

router.get('/sign-up-step-2', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("danger", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	} else {
		if (res.locals.user_infos.status != req.user_status.mustCreateMainPassword.value) {
			req.flash("warning", "You do not have the permission to access this page");
			return res.redirect("/");
		}
	}
	var form = form_create_main_password;

	res.render('user/sign-up-step-2', {
		title: 'Create your main password',
		myForm: form,
		uikitFieldHorizontal: uikitFieldHorizontal
	});
});

router.post('/sign-up-step-2', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("danger", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	} else {
		if (res.locals.user_infos.status != req.user_status.mustCreateMainPassword.value) {
			req.flash("warning", "You do not have the permission to access this page");
			return res.redirect("/");
		}
	}
	var form = form_create_main_password;
	form.handle(req, {
		success: function(form) {
			var generatePassword = require("password-maker");

			// Private key, never known
			var private_key = generatePassword(32);

			var main_password = CryptoJS.AES.encrypt(private_key, form.data.password);
			var unlocked_token = CryptoJS.AES.encrypt('unlocked', private_key);

			req.models.User.findOne({
				_id: req.session.user_id
			}, function(err, user) {
				if (err) return console.error(err);
				user.main_password = main_password;
				user.unlocked_token = unlocked_token;
				user.status = req.user_status.active.value;
				user.save(function(err) {
					if (err) return console.error(err);
					req.flash("success", "Your main password has been set");
					res.redirect("/user/sign-up-step-3");
				});
			});
		},
		error: function(form) {
			req.flash("danger", "The form contains errors");
			res.render('user/sign-up-step-2', {
				title: 'Create your main password',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		},
		empty: function(form) {
			res.render('user/sign-up-step-2', {
				title: 'Create your main password',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		}
	});
});

router.get('/sign-up-step-3', function(req, res, next) {
	if (!req.session.user_id) {
		req.flash("danger", "You must be logged in to access this page");
		return res.redirect("/user/sign-in");
	} else {
		if (res.locals.user_infos.status != req.user_status.active.value) {
			req.flash("warning", "You do not have the permission to access this page");
			return res.redirect("/");
		}
	}
	res.render('user/sign-up-step-3', {
		title: 'Welcome!'
	});
});

router.get('/sign-out', function(req, res, next) {
	req.session.user_id = undefined;
	req.flash("info", "You are now logged out");
	res.redirect("/");
});

router.get('/sign-in', function(req, res, next) {
	if (req.session.user_id) {
		req.flash("warning", "You are already signed in");
		return res.redirect("/");
	}
	var form = form_sign_in;

	res.render('user/sign-in', {
		title: 'Sign in',
		myForm: form,
		uikitFieldHorizontal: uikitFieldHorizontal
	});
});

router.post('/sign-in', function(req, res, next) {
	if (req.session.user_id) {
		req.flash("warning", "You are already signed in");
		return res.redirect("/");
	}
	var form = form_sign_in;
	form.handle(req, {
		success: function(form) {
			req.models.User.findOne({
				email: form.data.email,
				password: CryptoJS.SHA1(form.data.password).toString()
			}, function(err, user) {
				if (err) return console.error(err);
				if (user !== null) {
					req.session.user_id = user._id;
					user.dateLastAction = 0;
					user.save(function(err) {});
					req.flash("success", "Your are now logged in");
					res.redirect("/");
				} else {
					req.flash("warning", "No account found with these credentials");
					res.render('user/sign-in', {
						title: 'Sign in',
						myForm: form,
						uikitFieldHorizontal: uikitFieldHorizontal
					});
				}
			});
		},
		error: function(form) {
			req.flash("danger", "The form contains errors");
			res.render('user/sign-in', {
				title: 'Sign in',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		},
		empty: function(form) {
			res.render('user/sign-in', {
				title: 'Sign in',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		}
	});
});

module.exports = router;