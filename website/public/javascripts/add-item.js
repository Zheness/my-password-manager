$(function(){
	var field = $(".pwdShowHideGenerate");
	field.parent().append('&nbsp;<button id="showPwd" class="uk-button uk-button-primary" data-uk-tooltip title="Show" type="button"><span class="uk-icon-eye"></span></button>');
	field.parent().append('&nbsp;<button id="hidePwd" class="uk-button uk-button-primary" data-uk-tooltip title="Hide" type="button"><span class="uk-icon-eye-slash"></span></button>');
	field.parent().append('&nbsp;<button id="generatePwd" class="uk-button uk-button-primary" data-uk-tooltip title="Generate" type="button"><span class="uk-icon-refresh"></span></button>');
	var showPwd = $("#showPwd");
	var hidePwd = $("#hidePwd");
	var generatePwd = $("#generatePwd");
	hidePwd.hide();

	$(document).on("click", "#showPwd", function(){
		field.attr("type", "text");
		showPwd.hide();
		hidePwd.show();
	});
	$(document).on("click", "#hidePwd", function(){
		field.attr("type", "password");
		showPwd.show();
		hidePwd.hide();
	});
});