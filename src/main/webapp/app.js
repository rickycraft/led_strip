var app = angular.module("CopeApp", ["ngMaterial","ngMessages","ngAnimate","ngSanitize","ngAria","ui.router", "angular-momentjs"]);

app.config(function($urlRouterProvider, localStorageServiceProvider, $mdDateLocaleProvider){
	$urlRouterProvider.otherwise(function($injector){
		return "/home";
	});
	localStorageServiceProvider.setPrefix('LedStrip');
	localStorageServiceProvider.setDefaultToCookie(false);
	$mdDateLocaleProvider.formatDate = function(date) {
		return moment(date).format('DD/MM/YYYY');
	};
});

app.filter('trustAsHtml',['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

app.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data|local):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
