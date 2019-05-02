const utility = require("../utility");

const aggregate = list => {
	if (list.length < 1) {
		throw "empty_array";
	}
	return mapAverage(list);
};

const avgHour = list => {
	if (list.length < 1) {
		throw "empty_array";
	}
	let newList = [];
	let sameHour = [];
	for (i = 0; i < 24; i++) {
		list.forEach(element => {
			if (element.date.getHours() == i) {
				sameHour[sameHour.length] = element;
			}
		});
		if (sameHour.length < 1) {
			newList[i] = {
				temp: 0,
				humi: 0,
				bar: 0,
			};
		} else {
			newList[i] = mapAverage(sameHour);
		}
	}
	return newList;
};

const mapAverage = list => {
	let tmp = list.reduce((acc, curr) => {
		acc.temp += curr.temp;
		acc.bar += curr.bar;
		acc.humi += curr.humi;
		return acc;
	});

	tmp.temp = tmp.temp / list.length;
	tmp.bar = tmp.bar / list.length;
	tmp.humi = tmp.humi / list.length;

	return mapDecimal(tmp);
};

const mapType = (type, list) => {
	let res;
	switch (type) {
		case "a":
			res = list;
			break;
		case "t":
			res = list.map(data => data.temp);
			break;
		case "h":
			res = list.map(data => data.humi);
			break;
		case "b":
			res = list.map(data => data.bar);
			break;
		default:
			res = list;
	}
	return res;
};

const mapDecimal = obj => {
	let res = {};
	res.temp = parseInt(obj.temp.toFixed(1));
	res.humi = parseInt(obj.humi);
	res.bar = parseInt(obj.bar);
	return res;
};

const fixZero = list => {
	let zero = [];
	list.forEach((val, i) => {
		if (val == 0) {
			zero.push(i);
		}
	});
	zero.forEach((val, i));
};

module.exports = {
	aggregate: aggregate,
	avgHour: avgHour,
	mapType: mapType,
	mapDecimal: mapDecimal,
};
