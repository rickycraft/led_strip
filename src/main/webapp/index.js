app.controller("IndexCtrl", IndexCtrl);

function IndexCtrl($scope, $state, $moment, $mdToast, localStorageService, $mdSidenav, $timeout, UserService, $filter){
	
	$scope.reload = function() {
		$state.reload();
	}
	
	//funzione globale cambio stato
	$scope.goto = function(state, stateParams){
		$state.go(state, stateParams);
	}
	
	//funziona globale convertitore ms in Data
	$scope.convertToDate = function(ms, pattern){
		$scope.dataConvertito = $filter('date')(ms, pattern);
		return $scope.dataConvertito;
	}
	
	$scope.back = function(){
		window.history.back();
	}
	
	//configurazione moment
	$moment.updateLocale('en', {
		months : 'Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre'.split('_'),
        monthsShort : 'Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic'.split('_'),
        weekdays : 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_'),
        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Me_Gi_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            nextWeek: 'dddd [alle] LT',
            lastDay: '[Ieri alle] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[la scorsa] dddd [alle] LT';
                    default:
                        return '[lo scorso] dddd [alle] LT';
                }
            },
            sameElse: 'L'
        },
        dayOfMonthOrdinalParse : /\d{1,2}º/,
        ordinal: '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        },
	    relativeTime : {
	        future: "tra %s",
	        past:   "%s fa",
	        s  : 'pochi secondi',
	        ss : '%d secondi',
	        m:  "un minuto",
	        mm: "%d minuti",
	        h:  "un' ora",
	        hh: "%d ore",
	        d:  "un giorno",
	        dd: "%d giorni",
	        M:  "un mese",
	        MM: "%d mesi",
	        y:  "un anno",
	        yy: "%d anni"
	    }
	});
	
	$scope.serverErrorCallback = function(reason) {
		console.error(reason.data.debuggingDescription);
		console.error(reason.data.stackTrace);
	}
	$scope.serverErrorCallbackToast = function(reason) {
		$scope.showSimpleToast(reason.data.descrptionForUser, "bottom right", 2500);
		console.error(reason.data.debuggingDescription);
		console.error(reason.data.stackTrace);
	}
	
	//funzione mostra toast
	$scope.showSimpleToast = function(msg, pos, timeout) {
		$mdToast.show(
		      $mdToast.simple()
		        .textContent(msg)
		        .position(pos)
		        .hideDelay(timeout)
		    );
	}
	$scope.showActionToast = function(msg, pos, timeout, action, callback) {
	    var toast = $mdToast.simple()
	      .textContent(msg)
	      .action('OK')
	      .highlightAction(true)
	      .highlightClass('md-primary')// Accent is used by default, this just demonstrates the usage.
	      .position(pos)
	      .hideDelay(timeout);
	    $mdToast.show(toast).then(callback);
	  };
	
	//call string function
	$scope.callFunction = function(func) {
		eval("$scope."+func);
	}

}