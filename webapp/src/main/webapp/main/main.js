app.controller("MainCtrl", MainCtrl);

function MainCtrl($scope, ColorList){
	
	$scope.turnColor = function(color){
		console.log(eval("ColorList."+color));
	}
	
}