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
				password: CryptoJS.SHA1(form.data.password).toString()
			});
			new_user.save(function(err) {
				if (err) return console.error(err);
				res.render('user/sign-up', {
					title: 'Sign up',
					myForm: form,
					uikitFieldHorizontal: uikitFieldHorizontal
				});
			});
			res.render('user/sign-up', {
				title: 'Sign up',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		},
		error: function(form) {
			console.log("data invalid");
			res.render('user/sign-up', {
				title: 'Sign up',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		},
		empty: function(form) {
			console.log("no send");
			res.render('user/sign-up', {
				title: 'Sign up',
				myForm: form,
				uikitFieldHorizontal: uikitFieldHorizontal
			});
		}
	});

});

module.exports = router;