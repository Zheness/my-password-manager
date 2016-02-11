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

router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/sign-up', function(req, res, next) {
	var form = form_sign_up;

	res.render('user/sign-up', {
		title: 'Sign up',
		myForm: form,
		uikitFieldHorizontal: uikitFieldHorizontal
	});
});

router.post('/sign-up', function(req, res, next) {
	var form = form_sign_up;
	form.handle(req, {
		success: function(form) {
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
		return res.redirect("/user/sign-in");
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
		return res.redirect("/user/sign-in");
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
	res.render('user/sign-up-step-3', {
		title: 'Welcome!'
	});
});

router.get('/sign-out', function(req, res, next) {
	req.session.destroy(function(err) {
		if (err) return console.error(err);
	});
	req.flash("info", "You are now logged out");
	res.redirect("/");
});

module.exports = router;