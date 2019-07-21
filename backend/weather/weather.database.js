const mongoose = require("mongoose");
const Sensor = require("../models/sensor");
const { DateTime } = require("luxon");

const inRange = async range => {
	let start;
	let end;
	if (range.start != null && range.end != null) {
		start = range.start;
		end = range.end;
	} else throw "Give end an start";

	try {
		start = DateTime.fromObject(start);
		end = DateTime.fromObject(end);
	} catch (err) {
		throw "Invalid date format";
	}
	if (start > end) throw "Start is greater than end";
	const query = await Sensor.find({
		date: {
			$gte: start,
			$lte: end,
		},
	}).catch(err => {
		throw err;
	});
	return query;
};

const saveValue = async sensor => {
	const newData = new Sensor({
		_id: new mongoose.Types.ObjectId(),
		temp: sensor.temp,
		humi: sensor.humi,
		bar: sensor.bar,
		date: DateTime.local(),
	});
	console.log("saving", sensor, DateTime.local().toString());
	await newData
		.save()
		// eslint-disable-next-line no-unused-vars
		.then(result => {
			//sensor = result; uncomment if response should contain all data
		})
		.catch(err => {
			console.log("error ", err);
			throw err;
		});
};

const inDate = async (year, month, day) => {
	let s_date;
	let e_date;
	try {
		s_date = DateTime.fromObject({ year: year, month: month, day: day }); //zone also needed?
		e_date = DateTime.fromObject({ year: year, month: month, day: day });
	} catch (err) {
		throw "Invalid date";
	}
	if (day != null) {
		s_date = s_date.startOf("day");
		e_date = e_date.endOf("day");
	} else if (month != null) {
		s_date = s_date.startOf("month");
		e_date = e_date.endOf("month");
	} else if (year != null) {
		s_date = s_date.startOf("year");
		e_date = e_date.endOf("year");
	} else {
		throw "At least one parameter";
	}
	const query = await Sensor.find({
		date: {
			$gte: s_date,
			$lte: e_date,
		},
	}).catch(err => {
		throw err;
	});
	return query;
};

module.exports = {
	inRange: inRange,
	saveValue: saveValue,
	inDate: inDate,
};
