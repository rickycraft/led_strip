const express = require("express");
const router = express.Router();
const std_req = require("../utility").request;
const request = require("request");

const { DateTime } = require("luxon");
const utility = require("./weather.utility");
const db = require("./weather.database");
const schedule = require("node-schedule");

const sensor = {
	temp: 0, // 27.2 C
	bar: 0, // 1023 mBar
	humi: 0, // 36%
};
const base_url = "http://192.168.1.230";

const j = schedule.scheduleJob("0,30 * * * *", () => {
	request.get(base_url + "/data", async (err, response, body) => {
		//console.log("current time", DateTime.local().toString());
		try {
			if (err) {
				console.log("error occurred on ", err);
				throw err;
			} else {
				let result = JSON.parse(body);
				result = utility.mapDecimal(result);
				await db.saveValue(result);
			}
		} catch (err) {
			console.log("error on trigger", err);
		}
	});
});

router.get("/save", (req, res) => {
	std_req(base_url + "/data", res, async data => {
		data = mapDecimal(data);
		await db.saveValue(data);
		return data;
	});
});

router.get("/status", (req, res) => {
	std_req(base_url + "/", res, data => {
		return utility.mapDecimal(data);
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
		let result = await getResult(req.body);
		result = utility.aggregate(result); //reduce data to average
		res.status(200).json(result);
	} catch (err) {
		console.log("catched error", err);
		if (err == "empty_array") res.status(200).json({});
		else res.status(500).send(err);
	}
});

router.get("/avgH/:type/", async (req, res) => {
	console.log(req.params);
	try {
		let result = await getResult(req.body);
		result = utility.avgHour(result); //reduce data to average
		result = utility.mapType(req.params.type);
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
	return data.start != null ? await db.inRange(data) : await db.inDate(data.year, data.month, data.day);
}

module.exports = router;
