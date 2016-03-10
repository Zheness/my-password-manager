angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http) {
		var ctrl = this;
		this.items = [];
		this.loader = true;
		this.error = false;

		UIkit.grid("#containerItems", {
			gutter: 20
		});
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

					UIkit.grid("#containerItems", {
						gutter: 20
					});
				}
			},
			function errorCallback(response) {
				ctrl.loader = false;
				ctrl.error = true;
			}
		);


	})
	.directive('mpmProgress', function() {
		return {
			restrict: 'E',
			scope: {
				item: '=item',
			},
			template: '<div class="uk-margin-top uk-progress uk-progress-mini {{ item.pwd_strength_color }}" ng-show="item.infos_displayed" data-uk-tooltip title="{{ item.pwd_strength_title }}"><div class="uk-progress-bar" style="width: {{ item.pwd_strength_size }};"></div></div>'
		};
	})
	.directive('mpmIteminfo', function() {
		return {
			restrict: 'E',
			scope: {
				item: '=item',
			},
			transclude: true,
			controller: function($scope, $http) {
				$scope.togglePassword = function(item) {
					if (item.pwd_displayed) {
						item.password_hidden = item.old_pwd_hidden;
						item.pwd_displayed = false;
					} else {
						$http({
							method: "GET",
							url: "/ajax/password",
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

				$scope.toggleInfos = function(item) {
					if (item.infos_displayed) {
						item.infos_displayed = false;
						UIkit.grid("#containerItems", {
							gutter: 20
						});
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
									item.infos_displayed = true;
									var tmp_item = angular.copy(response.data.data);
									item.pwd_strength_size = tmp_item.password_strength / 5;
									item.comment = tmp_item.comment;
									if (item.pwd_strength_size >= 65)
										item.pwd_strength_color = "uk-progress-success";
									else if (item.pwd_strength_size >= 35)
										item.pwd_strength_color = "uk-progress-warning";
									else
										item.pwd_strength_color = "uk-progress-danger";

									if (item.pwd_strength_size >= 85)
										item.pwd_strength_title = "Very strong";
									else if (item.pwd_strength_size >= 70)
										item.pwd_strength_title = "Strong";
									else if (item.pwd_strength_size >= 50)
										item.pwd_strength_title = "Good";
									else if (item.pwd_strength_size >= 30)
										item.pwd_strength_title = "Weak";
									else
										item.pwd_strength_title = "Very weak";
									item.pwd_strength_size = item.pwd_strength_size + "%";
									UIkit.grid("#containerItems", {
										gutter: 20
									});
									//console.log(item);
								}
							},
							function errorCallback(response) {
								UIkit.notify("An error occured, please try again", "danger");
							}
						);
					}
				}
			},
			templateUrl: '/item-infos.html'
		};
	});