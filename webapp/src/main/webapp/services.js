app.service('Services', Services);

function Services($q, $http) {
	
	this.rgb = function(red, green, blue) {
		red *= 4;
		green *= 4;
		blu *= 4;
		var req = {
				method: 'HEAD',
				url: '192.168.1.110/&&R='+red+'G='+green+'B='+blue,
				data: null
		}
		return $http(req);
	}
	
}