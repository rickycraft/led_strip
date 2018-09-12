app.controller("RgbCtrl", RgbCtrl);

function RgbCtrl($scope){
	
	$scope.rgbEnabled = function(){
		if ($scope.isOn && $scope.fadeStatus == "off"){
			return true;
		} else {
			return false;
		}
	};
	
}