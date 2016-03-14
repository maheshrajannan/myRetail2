angular.module('priceInfoService', [])

	// super simple service
	// each function returns a promise object 
	.factory('PriceInfos', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/priceInfos');
			},
			create : function(priceInfoData) {
				console.log('priceInfoData' + priceInfoData);
				return $http.post('/api/priceInfos', priceInfoData);
			},
			delete : function(id) {
				return $http.delete('/api/priceInfos/' + id);
			}
		}
	}]);