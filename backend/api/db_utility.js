const mongoose = require("mongoose");
const Sensor = require("../models/sensor");
const { DateTime } = require("luxon");

const inRange = async range => {
	let start = range.start;
	let end = range.end;
	start["zone"] = "Europe/Rome";
	end["zone"] = "Europe/Rome";
	try {
		start = DateTime.fromObject(start);
		end = DateTime.fromObject(end);
	} catch {
		throw "Invalid date format";
	}
	if (start > end) throw "Start is greater than end";

	let out = 0;
	await Sensor.find(
		{
			date: {
				$gte: start,
				$lte: end,
			},
		},
		(err, data) => {
			if (err) throw err;
			else out = data;
		}
	);
	return out;
};

const saveValue = async sensor => {
	const newData = new Sensor({
		_id: new mongoose.Types.ObjectId(),
		temp: sensor.temp,
		humi: sensor.humi,
		bar: sensor.bar,
		date: DateTime.local(),
	});
	await newData
		.save()
		.then(result => {
			//sensor = result; uncomment if response should contain all data
		})
		.catch(err => {
			console.log("error ", err);
			throw err;
		});
};

const inDate = async (year, month, day) => {
	try {
		s_date = DateTime.fromObject({ year: year, month: month, day: day }); //zone also needed?
		e_date = DateTime.fromObject({ year: year, month: month, day: day });
	} catch {
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
	let result;
	await Sensor.find(
		{
			date: {
				$gte: s_date,
				$lte: e_date,
			},
		},
		(err, data) => {
			if (err) throw err;
			else {
				result = data;
			}
		}
	);
	return result;
};

function validateDate(rawDate) {
	try {
		return DateTime.fromObject(rawDate);
	} catch (err) {
		throw "Invalid date format";
	}
}

module.exports = {
	inRange: inRange,
	saveValue: saveValue,
	inDate: inDate,
};
