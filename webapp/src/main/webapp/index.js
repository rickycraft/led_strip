var app = angular.module("LedStrip", ["ngMaterial", "ngMessages", "ngAria", "ngAnimate", "ui.router", "LocalStorageModule"]);

app.config(function($urlRouterProvider, localStorageServiceProvider){
	$urlRouterProvider.otherwise(function($injector){
		return "/home";
	});
	localStorageServiceProvider.setPrefix('ledstrip');
	localStorageServiceProvider.setDefaultToCookie(false);
});

app.controller("IndexCtrl", IndexCtrl);

function IndexCtrl($scope, $log, Services){		
	$scope.isOn = false;
	$scope.statusText = "off";
	$scope.selectedIndex = 0;
	
	$scope.toggleStatus = function(){
		if ($scope.isOn){
			$scope.statusText = "off";
			$scope.color.red = 0;
			$scope.color.green = 0;
			$scope.color.blue = 0;
			$scope.color.lux = 0;
			$scope.isFade = false;
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
	 
	$scope.isFade = false;
	$scope.elwireStatus = "on";
	
	$scope.toggleFade = function(){
		$scope.isFade = !$scope.isFade;
	};
	
	$scope.fadeIcon = function(){
		return ($scope.isFade)? "cancel" : "tonality";
	}
	
	$scope.toggleElwire = function(){
		$scope.elwireStatus = ($scope.elwireStatus == "off")? "on" : "off";
	};
	
	$scope.isElwire = function(){	
		return (($scope.elwireStatus == "on")? false : true);
	};
	
	$scope.rgb = function(color){
		var rgbPromise = Services.rgb(color.r,color.g,color.b);
		rgbPromise.then(function onSuccess(){
			console.log('success');
		}, function onError(error){
			console.log('error '+error);
		});	
	}
	
	$scope.luxEnabled = function(){
		return ($scope.isOn && $scope.selectedIndex == 0)? true : false;		
	};
	
	
	
}