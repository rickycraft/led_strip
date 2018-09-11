var app = angular.module("LedStrip", ["ngMaterial", "ngMessages", "ngAria", "ngAnimate", "ui.router", "LocalStorageModule"]);

app.config(function($urlRouterProvider, localStorageServiceProvider){
	$urlRouterProvider.otherwise(function($injector){
		return "/home";
	});
	localStorageServiceProvider.setPrefix('LedStrip');
	localStorageServiceProvider.setDefaultToCookie(false);
});

app.controller("IndexCtrl", IndexCtrl);

function IndexCtrl($scope, $log){		
	$scope.status = false;
	$scope.statusText = "off";
	
	$scope.toggleStatus = function(){
		if ($scope.status){
			$scope.statusText = "off";
			$scope.color.red = 0;
			$scope.color.green = 0;
			$scope.color.blue = 0;
		} else {
			$scope.statusText = "on";
		}
		$scope.status = !$scope.status;
	}
	
	 $scope.color = {
		      red: 0,
		      green: 0,
		      blue: 0
		    };
	 
	 $scope.$watch('', function() {
	        console.log('');
	    });
}