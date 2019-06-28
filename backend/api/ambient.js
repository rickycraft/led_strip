const express = require("express");
const router = express.Router();
const request = require("request");

const lampUrl = "http://192.168.1.230";

var lamp = {
	status: false,
	lux: 0,
};

router.get("/toggle", async (req, res) => {
	await request.get(lampUrl + "/toggle", (err, response, body) => {
		if (err) {
			res.sendStatus(500);
		} else {
			lamp = JSON.parse(body);
			res.status(200).send(JSON.parse(body));
		}
	});
});

router.post("/lux", async (req, res) => {
	lamp.lux = mapValue(req.body, 0, 10, 0, 255).lux;
	await request.get(
		{
			url: lampUrl + "/lux",
			qs: {
				lux: lamp.lux,
			},
		},
		(err, response, body) => {
			if (err) {
				res.sendStatus(500);
			} else {
				lamp = mapValue(JSON.parse(body), 0, 255, 0, 10);
				res.status(200).send(lamp);
			}
		}
	);
});

router.get("/status", async (req, res) => {
	await request.get(lampUrl + "/status", (err, response, body) => {
		if (err) {
			res.sendStatus(500);
		} else {
			lamp = mapValue(JSON.parse(body), 0, 255, 0, 10);
			res.status(200).send(lamp);
		}
	});
});

function mapValue(data, in_min, in_max, out_min, out_max) {
	const x = data.lux;
	const i = ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	data.lux = Math.round(i);
	return data;
}

module.exports = router;
