var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var widgets = forms.widgets;

/*
 * Forms helpers
 */
exports.uikitFieldHorizontal = function(name, object) {
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
exports.form_sign_up = forms.create({
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

exports.form_create_main_password = forms.create({
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

exports.form_sign_in = forms.create({
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