var express = require('express');
var router = express.Router();

router.get('/items', function(req, res, next) {
	res.set("Content-type", "application/json");
	var options = {
		user_id: req.session.user_id
	};
	req.models.Totp.find(options,
		"_id title",
		function(err, items) {
			if (err) {
				return res.send(JSON.stringify({
					"error": true,
					"message": "No item can be fetched"
				}));
			}
			return res.send(JSON.stringify({
				"error": false,
				"message": "",
				"data": items
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