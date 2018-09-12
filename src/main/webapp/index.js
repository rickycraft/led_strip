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
	$scope.isOn = false;
	$scope.statusText = "off";
	
	$scope.toggleStatus = function(){
		if ($scope.isOn){
			$scope.statusText = "off";
			$scope.color.red = 0;
			$scope.color.green = 0;
			$scope.color.blue = 0;
			$scope.fadeStatus = "on"
		} else {
			$scope.statusText = "on";
		}
		$scope.isOn = !$scope.isOn;
	}
	
	 $scope.color = {
		      red: 0,
		      green: 0,
		      blue: 0
		    };
	 
	 $scope.$watch('', function() {
	        console.log('');
	    });
	 
	$scope.fadeStatus = "on";
	$scope.elwireStatus = "on";
	
	$scope.toggleFade = function(){
		$scope.fadeStatus = ($scope.fadeStatus == "off")? "on" : "off";
	};
	
	$scope.toggleElwire = function(){
		$scope.elwireStatus = ($scope.elwireStatus == "off")? "on" : "off";
	};
	
	$scope.isElwire = function(){	
//		if ($scope.elwireStatus == "on"){
//			return false;
//		} else {
//			return true;
//		}
		return (($scope.elwireStatus == "on")? false : true);
	};
	
}