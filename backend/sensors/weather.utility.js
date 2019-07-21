const empty = {
	temp: 0,
	humi: 0,
	bar: 0,
};

const avgHour = list => {
	if (list.length < 1) {
		throw "empty array";
	}
	let avg = [];
	let sameHour = [];
	for (let i = 0; i < 24; i++) {
		// select same hour
		list.forEach(element => {
			if (element.date.getHours() == i) {
				sameHour.push(element);
			}
		});
		// if no data set obj to 0
		avg[i] = sameHour.length < 1 ? empty : mapAverage(sameHour);
	}
	return avg;
};

const mapAverage = list => {
	if (list.length < 1) {
		throw "empty array";
	}
	// add all values
	let tmp = list.reduce((acc, curr) => {
		acc.temp += curr.temp;
		acc.bar += curr.bar;
		acc.humi += curr.humi;
		return acc;
	});
	// divide for the lenght
	tmp.temp = tmp.temp / list.length;
	tmp.bar = tmp.bar / list.length;
	tmp.humi = tmp.humi / list.length;
	// parse values
	return parseData(tmp);
};

const parseData = obj => {
	return {
		temp: parseFloat(obj.temp.toFixed(1)),
		humi: parseInt(obj.humi),
		bar: parseInt(obj.bar),
	};
};

module.exports = {
	avgHour: avgHour,
	mapAverage: mapAverage,
	parseData: parseData,
};
