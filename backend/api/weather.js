const express = require("express");
const router = express.Router();
const std_req = require("./utility").request;

const mongoose = require("mongoose");
const Sensor = require("../models/sensor");
const { DateTime } = require("luxon");

const base_url = "http://192.168.1.230";

var sensor = {
	temp: 0, // 27.2 C
	bar: 0, // 1023 mBar
	humi: 0, // 36%
};

router.get("/read", (req, res) => {
	std_req(base_url + "/data", res, async data => {
		sensor = mapDecimal(data);
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
		return sensor;
	});
});

router.get("/status", (req, res) => {
	std_req(base_url + "/", res, data => {
		sensor = mapDecimal(data);
		console.log(new Date());
		return sensor;
	});
});

router.get("/all", (req, res) => {
	Sensor.find(
		{
			date: {
				$gte: DateTime.fromObject({ year: 2019, month: 4, day: 20, hour: 20 }),
				$lte: DateTime.fromObject({ year: 2019, month: 4, day: 25 }),
			},
		},
		(err, data) => {
			if (err) {
				console.log("error ", err);
				res.status(500).json({
					error: err,
				});
			} else {
				console.log(convertDateTime(data[0].date).hour);
				res.status(200).json(data);
			}
		}
	).exec();
});

router.get("/date", (req, res) => {
	res.status(200).json({ date: DateTime.local() });
});

function mapDecimal(obj) {
	obj.temp = obj.temp.toFixed(1);
	obj.humi = obj.humi.toFixed(0);
	obj.bar = obj.bar.toFixed(0);
	return obj;
}

function convertDateTime(date) {
	const newDate = date.toISOString();
	return DateTime.fromISO(newDate);
}

module.exports = router;
