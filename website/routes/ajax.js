var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
var forms = require("../forms");

router.get('/items', function(req, res, next) {
	res.set("Content-type", "application/json");
	req.models.Item.find({
			user_id: req.session.user_id
		},
		"_id title url username password_hidden",
		function(err, items) {
			if (err) return console.error(err);
			//console.log(items);
			return res.send(JSON.stringify({
				"error": false,
				"message": "",
				"data": items
			}));
		});
	//res.send('Hello World!');
});

module.exports = router;