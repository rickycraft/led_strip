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
	var nTab = 1; //as array index 0,1,2,...
	$scope.selectedIndex = 1;
	
	$scope.swipeRight = function(){
		if ($scope.selectedIndex > 0){
			$scope.selectedIndex -= 1;
		}
	};
	
	$scope.swipeLeft = function(){
		if ($scope.selectedIndex < nTab){
			$scope.selectedIndex += 1;
		}
	};
	
	 $scope.color = {
		      red: 0,
		      green: 0,
		      blue: 0
		    };
	 
	 $scope.$watch('', function() {
	        console.log('');
	    });
}