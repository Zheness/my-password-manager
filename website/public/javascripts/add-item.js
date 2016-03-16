$(function() {
	var modal = UIkit.modal("#modalGeneratePwd");
	var field = $(".pwdShowHideGenerate");
	field.parent().append('&nbsp;<button id="showPwd" class="uk-button uk-button-primary" data-uk-tooltip title="Show" type="button"><span class="uk-icon-eye"></span></button>');
	field.parent().append('&nbsp;<button id="hidePwd" class="uk-button uk-button-primary" data-uk-tooltip title="Hide" type="button"><span class="uk-icon-eye-slash"></span></button>');
	field.parent().append('&nbsp;<button id="generatePwd" class="uk-button uk-button-primary" data-uk-tooltip title="Generate" type="button"><span class="uk-icon-refresh"></span></button>');
	var showPwd = $("#showPwd");
	var hidePwd = $("#hidePwd");
	var generatePwd = $("#generatePwd");
	hidePwd.hide();
	generatePassword();

	$(document).on("click", "#showPwd", function() {
		field.attr("type", "text");
		showPwd.hide();
		hidePwd.show();
	});
	$(document).on("click", "#hidePwd", function() {
		field.attr("type", "password");
		showPwd.show();
		hidePwd.hide();
	});
	$(document).on("click", "#generatePwd", function() {
		modal.show();
	});
	$(document).on("change", "#formPwgGen", function(e) {
		if (e.target.id == "pwdGen_pwd")
			return false;
		generatePassword();
	});
	$(document).on("change mousemove", "#pwdGen_length", function() {
		$("#pwdGen_length_display").text($("#pwdGen_length").val());
	});
	$(document).on("submit", "#formPwgGen", function() {
		return false;
	});
	$(document).on("click", "#btnNewPwd", function() {
		generatePassword();
	});
	$(document).on("click", "#btnUsePwd", function() {
		field.val($("#pwdGen_pwd").val());
		modal.hide();
	});
});

function generatePassword() {
	var pwdGen_length = $("#pwdGen_length");
	var pwdGen_numbers = $("#pwdGen_numbers");
	var pwdGen_lowercase = $("#pwdGen_lowercase");
	var pwdGen_uppercase = $("#pwdGen_uppercase");
	var pwdGen_specials = $("#pwdGen_specials");
	var optionsPwd = {
		'length': pwdGen_length.val(),
		'numeric': pwdGen_numbers.is(':checked'),
		'lowercase': pwdGen_lowercase.is(':checked'),
		'uppercase': pwdGen_uppercase.is(':checked'),
		'special': pwdGen_specials.is(':checked')
	};
	$("#pwdGen_length_display").text(pwdGen_length.val());
	if (!(pwdGen_numbers.is(':checked') || pwdGen_lowercase.is(':checked') || pwdGen_uppercase.is(':checked') || pwdGen_specials.is(':checked'))) {
		$("#pwdGen_pwd").val("Please choose one or more options above");
	} else {
		$("#pwdGen_pwd").val($.passGen(optionsPwd));
	}
}