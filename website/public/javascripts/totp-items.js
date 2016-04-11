angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http, $interval) {
		var ctrl = this;
		this.items = [];
		this.loader = true;
		this.error = false;
		this.nextTick = 30000;

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
						ctrl.items = angular.copy(response.data.data.items);
						ctrl.loader = false;
						this.nextTick = angular.copy(response.data.data.nextTick);
						$interval.cancel(this.timer);
						this.timer = $interval(function() {
							loadItems();
						}, this.nextTick);
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