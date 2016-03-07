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
				console.log(response.data);
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
				// UIkit.notify("An error occured, please try again", "danger");
			}
		);
	});