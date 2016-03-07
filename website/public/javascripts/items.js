angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http) {
		var ctrl = this;
		this.items = [];
		this.loader = true;
		this.error = false;
		$http({
			method: "GET",
			url: "/ajax/items"
		}).then(
			function successCallback(response) {
				if (response.data.error) {
					UIkit.notify(response.data.message, "danger");
				} else {
					ctrl.items = angular.copy(response.data.data);
					ctrl.loader = false;
				}
			},
			function errorCallback(response) {
				ctrl.loader = false;
				ctrl.error = true;
			}
		);

		this.togglePassword = function(item) {
			if (item.pwd_displayed) {
				item.password_hidden = item.old_pwd_hidden;
				item.pwd_displayed = false;
			} else {
				$http({
					method: "GET",
					url: "/ajax/item",
					params: {
						item_id: item._id
					}
				}).then(
					function successCallback(response) {
						if (response.data.error) {
							UIkit.notify(response.data.message, "danger");
						} else {
							item.pwd_displayed = true;
							item.password = angular.copy(response.data.data);
							item.old_pwd_hidden = item.password_hidden;
							item.password_hidden = item.password;
						}
					},
					function errorCallback(response) {
						UIkit.notify("An error occured, please try again", "danger");
					}
				);
			}
		}
	});