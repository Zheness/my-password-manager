angular.module('mpmApp', [])
	.controller('ListController', function($scope, $http) {
		var ctrl = this;
		this.items = [];
		this.categories = [{
			id: "all",
			title: "All"
		}];
		this.loader = true;
		this.error = false;
		this.bAddCategory = false;
		this.category = "all";
		this.new_category = "";

		function loadItems() {
			$http({
				method: "GET",
				url: "/ajax/items",
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

		this.displayAddCategory = function() {
			ctrl.bAddCategory = true;
		}

		this.addCategory = function() {
			$http({
				method: "POST",
				url: "/ajax/category",
				data: {
					category: ctrl.new_category
				}
			}).then(
				function successCallback(response) {
					if (response.data.error) {
						UIkit.notify(response.data.message, "danger");
					} else {
						ctrl.categories.push(angular.copy(response.data.data));
						ctrl.new_category = "";
						ctrl.bAddCategory = false;
					}
				},
				function errorCallback(response) {
					ctrl.loader = false;
					ctrl.error = true;
				}
			);
		}

		this.cancelAddCategory = function() {
			ctrl.bAddCategory = false;
			ctrl.new_category = "";
		}

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
				item: '=',
				items: '=',
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
									item.pwd_strength_color = get_pwd_strength_color(item.pwd_strength_size);
									item.pwd_strength_title = get_pwd_strength_title(item.pwd_strength_size);
									item.pwd_strength_size = item.pwd_strength_size + "%";
								}
							},
							function errorCallback(response) {
								UIkit.notify("An error occured, please try again", "danger");
							}
						);
					}
				}

				$scope.toggleEdit = function(item) {
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
								item.toEdit = !item.toEdit;
								item.title_toedit = item.title;
								item.comment_toedit = item.comment;
								item.url_toedit = item.url;
								item.username_toedit = item.username;
								item.password = angular.copy(response.data.data);
							}
						},
						function errorCallback(response) {
							UIkit.notify("An error occured, please try again", "danger");
						}
					);
				}
				$scope.deleteItem = function(item) {
					$http({
						method: "DELETE",
						url: "/ajax/item",
						params: {
							item_id: item._id
						}
					}).then(
						function successCallback(response) {
							if (response.data.error) {
								UIkit.notify(response.data.message, "danger");
							} else {
								var items = [];
								for (var i = 0; i < $scope.items.length; i++) {
									if ($scope.items[i]._id != item._id) {
										items.push($scope.items[i]);
									}
								};
								$scope.items = items;
								UIkit.notify("Item successfully deleted", "success");
							}
						},
						function errorCallback(response) {
							UIkit.notify("An error occured, please try again", "danger");
						}
					);
				}
			},
			templateUrl: '/item-infos.html'
		};
	})
	.directive('mpmItemedit', function() {
		return {
			restrict: 'E',
			scope: {
				item: '=item',
			},
			transclude: true,
			controller: function($scope, $http) {
				$scope.edit = function(item) {
					$http({
						method: "POST",
						url: "/ajax/item",
						data: {
							item_id: item._id,
							item_title: item.title_toedit,
							item_comment: item.comment_toedit,
							item_url: item.url_toedit,
							item_username: item.username_toedit,
							item_password: item.password
						}
					}).then(
						function successCallback(response) {
							if (response.data.error) {
								UIkit.notify(response.data.message, "danger");
							} else {
								var item_tmp = angular.copy(response.data.data);
								item.title = item_tmp.title;
								item.comment = item_tmp.comment;
								item.url = item_tmp.url;
								item.username = item_tmp.username;
								item.password_hidden = item_tmp.password_hidden;
								item.pwd_displayed = false;


								item.pwd_strength_size = item_tmp.password_strength / 5;
								item.pwd_strength_color = get_pwd_strength_color(item.pwd_strength_size);
								item.pwd_strength_title = get_pwd_strength_title(item.pwd_strength_size);
								item.pwd_strength_size = item.pwd_strength_size + "%";

								item.toEdit = !item.toEdit;
								UIkit.notify("Item saved", "success");
							}
						},
						function errorCallback(response) {
							UIkit.notify("An error occured, please try again", "danger");
						}
					);

				}
				$scope.toggleEdit = function(item) {
					item.toEdit = !item.toEdit;
				}
			},
			templateUrl: '/item-edit.html'
		};
	});

function get_pwd_strength_color(strength) {
	if (strength >= 65)
		return "uk-progress-success";
	else if (strength >= 35)
		return "uk-progress-warning";
	else
		return "uk-progress-danger";
}

function get_pwd_strength_title(strength) {
	if (strength >= 85)
		return "Very strong";
	else if (strength >= 70)
		return "Strong";
	else if (strength >= 50)
		return "Good";
	else if (strength >= 30)
		return "Weak";
	else
		return "Very weak";
}
$(function() {
	var clipboard = new Clipboard(".btnCopy", {
		text: function(trigger) {
			var tmp = "null";
			$.ajax({
				method: "GET",
				url: "/ajax/password",
				dataType: "json",
				data: {
					item_id: trigger.getAttribute('data-item-id')
				},
				async: false
			}).done(
				function(response) {
					if (response.error) {
						UIkit.notify(response.message, "danger");
					} else {
						tmp = response.data;
					}
				}
			).fail(
				function(response) {
					console.log("fail");
					UIkit.notify("An error occured, please try again", "danger");
				}
			);
			return tmp;
		}
	});
});