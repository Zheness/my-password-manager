angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http) {
		var ctrl = this;
		this.items = [];
		this.loader = true;
		this.error = false;
		$http({
			method: "GET",
			url: "/ajax"
		}).then(
			function successCallback(response) {
				ctrl.items = angular.copy(response.data);
			},
			function errorCallback(response) {
				ctrl.loader = false;
				ctrl.error = true;
				// UIkit.notify("An error occured, please try again", "danger");
			}
		);
	});