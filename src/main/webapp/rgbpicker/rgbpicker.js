app.controller("RgbCtrl", RgbCtrl);

function RgbCtrl($scope){
	
	$scope.rgbEnabled = function(){
		if ($scope.isOn && !$scope.isFade){
			return true;
		} else {
			return false;
		}
	};
	
}