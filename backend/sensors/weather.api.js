/* eslint-disable no-unused-vars */
const express = require("express");
const router = express.Router();

const std_req = require("../utility").request;
const request = require("request");
const utility = require("./weather.utility");
const db = require("./weather.database");
const schedule = require("node-schedule");

const sensor = {
	temp: 0, // 27.2 C
	bar: 0, // 1023 mBar
	humi: 0, // 36%
};
const base_url = "http://192.168.1.230";

const j = schedule.scheduleJob("0 * * * *", () => {
	request.get(base_url + "/data", async (err, response, body) => {
		try {
			if (err) {
				console.err(err);
				throw err;
			} else {
				const result = JSON.parse(body);
				await db.saveValue(result);
			}
		} catch (err) {
			console.err(err);
		}
	});
});

router.get("/save", (req, res) => {
	std_req(base_url + "/data", res, async data => {
		await db.saveValue(data);
		return data;
	});
});

router.get("/status", (req, res) => {
	std_req(base_url + "/", res, data => {
		return utility.mapDecimal(data);
	});
});

router.get("/avgH", async (req, res) => {
	try {
		const result = await db.inRange(req.body); //get all data in this range
		const avgHour = utility.avgHour(result); //reduce data to average for each hour
		res.status(200).json(avgHour);
	} catch (err) {
		console.err(err);
		res.status(500).send(err);
	}
});

router.post("/avg", async (req, res) => {});

module.exports = router;
