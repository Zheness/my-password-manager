var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/sign-up', function(req, res, next) {
	res.render('user/sign-up', {
		title: 'Sign up'
	});
});

module.exports = router;
