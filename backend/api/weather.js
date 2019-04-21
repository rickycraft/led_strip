const express = require("express");
const router = express.Router();
const std_req = require("./utility").request;

const { DateTime } = require("luxon");
const db_sensor = require("../database/db.sensor");

const base_url = "http://192.168.1.230";

const sensor = {
	temp: 0, // 27.2 C
	bar: 0, // 1023 mBar
	humi: 0, // 36%
};

router.get("/save", (req, res) => {
	std_req(base_url + "/data", res, async data => {
		data = mapDecimal(data);
		await db_sensor.saveValue(data);
		return data;
	});
});

router.get("/status", (req, res) => {
	std_req(base_url + "/", res, data => {
		return mapDecimal(data);
	});
});

router.get("/range", async (req, res) => {
	try {
		const result = await getResult(req.body);
		res.status(200).json(result);
	} catch (err) {
		console.log("err", err);
		res.status(500).send(err);
	}
});

router.get("/avg", async (req, res) => {
	try {
		const result = getResult(req.body);
		result = db_sensor.aggregate(result); //reduce data to average
		result = mapDecimal(result); //map to decimal
		res.status(200).json(result);
	} catch (err) {
		console.log("catched error", err);
		if (err == "empty_array") res.status(200).json({});
		else res.status(500).send(err);
	}
});

router.get("/test", (req, res) => {
	res.status(200).json({ date: DateTime.fromObject({ month: 10 }).toString() });
});

async function getResult(data) {
	//TODO more data validation
	return data.start != null ? await db_sensor.inRange(data) : await db_sensor.inDate(data.year, data.month, data.day);
}

function mapDecimal(obj) {
	let res = {};
	res.temp = obj.temp.toFixed(1);
	res.humi = obj.humi.toFixed(0);
	res.bar = obj.bar.toFixed(0);
	return res;
}

module.exports = router;
