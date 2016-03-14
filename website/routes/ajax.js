var express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
var forms = require("../forms");
var strength = require('strength');

router.get('/items', function(req, res, next) {
	res.set("Content-type", "application/json");
	req.models.Item.find({
			user_id: req.session.user_id
		},
		"_id title url username password_hidden",
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

router.get('/password', function(req, res, next) {
	res.set("Content-type", "application/json");
	req.models.Item.findOne({
			_id: req.query.item_id,
			user_id: req.session.user_id
		},
		"_id password",
		function(err, item) {
			if (err || item == null) {
				return res.send(JSON.stringify({
					"error": true,
					"message": "The item is not available"
				}));
			}
			req.models.User.findOne({
				_id: req.session.user_id
			}, function(err, user) {
				if (err) return console.error(err);

				var pv_key = CryptoJS.AES.decrypt(req.session.password, user.tmp_pk).toString(CryptoJS.enc.Utf8);
				var is_unlocked = CryptoJS.AES.decrypt(user.unlocked_token, pv_key).toString(CryptoJS.enc.Utf8);

				if (is_unlocked == "unlocked") {
					return res.send(JSON.stringify({
						"error": false,
						"message": "",
						"data": CryptoJS.AES.decrypt(item.password, pv_key).toString(CryptoJS.enc.Utf8)
					}));
				} else {
					return res.send(JSON.stringify({
						"error": true,
						"message": "Your main password is incorrect"
					}));
				}
			});
		});
});

router.get('/item', function(req, res, next) {
	res.set("Content-type", "application/json");
	req.models.Item.findOne({
			_id: req.query.item_id,
			user_id: req.session.user_id
		},
		"_id title url username password_hidden comment password_strength",
		function(err, item) {
			if (err) {
				return res.send(JSON.stringify({
					"error": true,
					"message": "The item is not available"
				}));
			}
			return res.send(JSON.stringify({
				"error": false,
				"message": "",
				"data": item
			}));
		});
});

router.post('/item', function(req, res, next) {
	res.set("Content-type", "application/json");
	req.models.User.findOne({
		_id: req.session.user_id
	}, function(err, user) {
		if (err) return console.error(err);
		req.models.Item.findOne({
				_id: req.body.item_id,
				user_id: req.session.user_id
			},
			function(err, item) {
				if (err || item == null) {
					return res.send(JSON.stringify({
						"error": true,
						"message": "The item is not available"
					}));
				}
				var pwd_hidden = "";
				var max_length = req.body.item_password.length;
				for (var i = 0; i < max_length; i++) {
					pwd_hidden += "*";
				};
				var pv_key = CryptoJS.AES.decrypt(req.session.password, user.tmp_pk).toString(CryptoJS.enc.Utf8);
				var is_unlocked = CryptoJS.AES.decrypt(user.unlocked_token, pv_key).toString(CryptoJS.enc.Utf8);

				if (is_unlocked != "unlocked") {
					return res.send(JSON.stringify({
						"error": true,
						"message": "Your current main password is incorrect"
					}));
				}

				item.title = req.body.item_title;
				item.url = req.body.item_url;
				item.username = req.body.item_username;
				item.password = CryptoJS.AES.encrypt(req.body.item_password, pv_key);
				item.password_hidden = pwd_hidden;
				item.password_strength = strength(req.body.item_password) * 100;
				item.comment = req.body.item_comment;

				item.save(function(err) {
					if (err) return console.error(err);
					req.models.Item.findOne({
							_id: req.body.item_id,
							user_id: req.session.user_id
						},
						"_id title url username password_hidden comment password_strength",
						function(err, c_item) {
							if (err) {
								return res.send(JSON.stringify({
									"error": true,
									"message": "The item is not available"
								}));
							}
							return res.send(JSON.stringify({
								"error": false,
								"message": "",
								"data": c_item
							}));
						});
				});
			});
	});
});

router.get('/delete', function(req, res, next) {
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