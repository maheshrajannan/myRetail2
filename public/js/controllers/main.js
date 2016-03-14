angular.module('priceInfoController', [])

	// inject the PriceInfo service factory into our controller
	.controller('mainController', ['$scope','$http','PriceInfos', function($scope, $http, PriceInfos) {
		$scope.formData = {};
		$scope.loading = true;

		// GET =====================================================================
		// when landing on the page, get all priceInfos and show them
		// use the service to get all the priceInfos
		PriceInfos.get()
			.success(function(data) {
				$scope.products = data;
				$scope.loading = false;
			});

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createPriceInfo = function() {
			console.log('create price info');

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.value != undefined) {
				$scope.loading = true;
				console.log('create price info' + $scope.formData.value);

				// call the create function from our service (returns a promise object)
				PriceInfos.create($scope.formData)

					// if successful creation, call our get function to get all the new priceInfos
					.success(function(data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.priceInfos = data; // assign our new list of priceInfos
					});
			}
		};

		// DELETE ==================================================================
		// delete a priceInfo after checking it
		$scope.deletePriceInfo = function(id) {
			$scope.loading = true;

			PriceInfos.delete(id)
				// if successful creation, call our get function to get all the new priceInfos
				.success(function(data) {
					$scope.loading = false;
					$scope.priceInfos = data; // assign our new list of priceInfos
				});
		};
	}]);