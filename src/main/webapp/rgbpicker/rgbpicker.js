app.controller("RgbCtrl", RgbCtrl);

function RgbCtrl($scope){
	
	$scope.rgbEnabled = function(){
		if ($scope.isOn && !$scope.isFade){
			return true;
		} else {
			return false;
		}
	};
	
	$scope.resetSlider = function(){
		$scope.color.red = 0;
		$scope.color.green = 0;
		$scope.color.blue = 0;
	}
	
}