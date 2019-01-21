app.service('Services', Services);

function Services($q, $http) {

	this.rgb = function(red, green, blue) {
		var req = {
				method: 'HEAD',
				url: '192.168.1.220/&&R='+red+'G='+green+'B='+blue,
				data: null
		}
		return $http(req);
	}

}
