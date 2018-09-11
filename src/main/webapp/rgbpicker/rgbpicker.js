app.controller("RgbCtrl", RgbCtrl);

function RgbCtrl($scope){
	
	$scope.fadeStatus = "on";
	$scope.elwireStatus = "on";
	
	$scope.toggleFade = function(){
		$scope.fadeStatus = ($scope.fadeStatus == "off")? "on" : "off";
	};
	
	$scope.toggleElwire = function(){
		$scope.elwireStatus = ($scope.elwireStatus == "off")? "on" : "off";
	};
	
}