angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http) {
		var ctrl = this;
		this.items = [];
		this.loader = true;
		this.error = false;

		function loadItems() {
			ctrl.items = [];
			ctrl.loader = true;
			$http({
				method: "GET",
				url: "/ajax/totp/items",
				params: {
					category: ctrl.category
				}
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
		}
		loadItems();
	});