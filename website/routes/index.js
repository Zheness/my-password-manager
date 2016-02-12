var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.user_id) {
		if (res.locals.user_infos.status == req.user_status.mustCreateMainPassword.value) {
			req.flash("warning", "You must set your main password to use this app");
			return res.redirect("/user/sign-up-step-2");
		}
	}
	res.render('index', {
		title: 'Home'
	});
});

module.exports = router;