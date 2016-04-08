var express = require('express');
var router = express.Router();
var speakeasy = require('speakeasy');

router.get('/items', function(req, res, next) {
	res.set("Content-type", "application/json");
	var options = {
		user_id: req.session.user_id
	};
	req.models.Totp.find(options,
		"_id title secret",
		function(err, items) {
			if (err) {
				return res.send(JSON.stringify({
					"error": true,
					"message": "No item can be fetched"
				}));
			}
			var totp_items = [];
			for (var i = 0; i < items.length; i++) {
				totp_items.push({
					_id: items[i]._id,
					title: items[i].title,
					code: speakeasy.totp({
						secret: items[i].secret,
						encoding: 'base32'
					})
				});
			};
			return res.send(JSON.stringify({
				"error": false,
				"message": "",
				"data": totp_items
			}));
		});
});

router.delete('/item', function(req, res, next) {
	res.set("Content-type", "application/json");
	req.models.Item.findOne({
		_id: req.query.item_id,
		user_id: req.session.user_id
	}).remove(function(err) {
		if (err) {
			return res.send(JSON.stringify({
				"error": true,
				"message": "The item is not available"
			}));
		}
		return res.send(JSON.stringify({
			"error": false,
			"message": ""
		}));
	});
});

module.exports = router;