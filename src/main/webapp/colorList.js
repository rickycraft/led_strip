app.service('ColorList', ColorList);

function ColorList() {
	
	this.white = {
			r: 240,
			g: 240,
			b: 255
	};
	
	this.red = {
			r: 255,
			g: 0,
			b: 0
	};
	
	this.green = {
			r: 0,
			g: 255,
			b: 0
	};
	
	this.blue = {
			r: 0,
			g: 0,
			b: 255
	};
	
	this.orange = {
			r: 255,
			g: 110,
			b: 0
	}
	
	this.purple = {
			r: 170,
			g: 0,
			b: 255
	}
	
	this.lgreen = {
			r: 100,
			g: 220,
			b: 20
	}
	
	this.warm = {
			r: 255,
			g: 180,
			b: 70
	}
	
	this.cold = {
			r: 180,
			g: 130,
			b: 240
	}
	
}