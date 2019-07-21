const mongoose = require("mongoose");
const Sensor = require("../models/sensor");
const utility = require("./weather.utility");
const moment = require("moment");

const inRange = async range => {
	const start = moment(range.start)
		.startOf("day")
		.toDate();
	const end = moment(range.end)
		.endOf("day")
		.toDate();
	if (moment(start).isAfter(end)) throw "Start is greater than end";
	return await Sensor.find({
		date: {
			$gte: start,
			$lte: end,
		},
	});
};

const saveValue = async sensor => {
	sensor = utility.parseData(sensor);
	const newData = new Sensor({
		_id: new mongoose.Types.ObjectId(),
		temp: sensor.temp,
		humi: sensor.humi,
		bar: sensor.bar,
		date: moment().toDate(),
	});
	console.log("saving", sensor, moment().toString());
	await newData.save().catch(err => {
		console.err("err saving val ", err);
		throw err;
	});
};

module.exports = {
	getRange: inRange,
	saveValue: saveValue,
};
