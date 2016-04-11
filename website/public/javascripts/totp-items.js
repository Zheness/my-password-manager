angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http, $interval) {
		var ctrl = this;
		this.items = [];
		this.loader = true;
		this.error = false;
		this.nextTick = 30000;

		this.refreshNow = function() {
			loadItems();
		}

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
						$("#timer").attr("data-time", this.nextTick);
						$("#timer").circletimer({
							timeout: this.nextTick,
							onUpdate: function(elapsed) {
								$("#timeLeft").text(Math.floor(($("#timer").attr("data-time") - Math.round(elapsed)) / 1000));
							},
						});
						$("#timer").circletimer("start");
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