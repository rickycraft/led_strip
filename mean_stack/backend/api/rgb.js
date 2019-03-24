const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const request = require("request");

const baseUrl = "http://192.168.1.220";
const errorTitle = "in RGB ";

var led = {
	red: 0,
	green: 0,
	blu: 0,
	lux: 0,
	ew: false,
};

router.get("/status", async (req, res) => {
	await request.get(baseUrl + "/status", (err, response, body) => {
		if (err) {
			if (err.code === "ETIMEDOUT") {
				console.log("timeout error ", errorTitle, "/status");
				res.sendStatus(408);
			} else {
				console.log("error occurred", errorTitle, "/status");
				res.sendStatus(500);
			}
		} else {
			led = JSON.parse(body);
			res.status(200).json(led);
		}
	});
});

router.get("/off", async (req, res) => {
	led.lux = 0;
	await setLed(res);
});

router.post("/color", async (req, res) => {
	req.body.red != null ? (led.red = req.body.red) : "";
	req.body.green != null ? (led.green = req.body.green) : "";
	req.body.blu != null ? (led.blu = req.body.blu) : "";
	req.body.lux != null ? (led.lux = req.body.lux) : "";
	await setLed(res);
});

async function setLed(res) {
	console.log(led);
	let params = querystring.stringify(led);
	await request.get(baseUrl + "/led?" + params, (err, response, body) => {
		//get request
		if (!response) {
			console.log("response undefined", errorTitle, "/color");
			res.sendStatus(500);
		} else if (err) {
			if (err.code === "ETIMEDOUT") {
				console.log("timeout error ", errorTitle, "/color");
				res.sendStatus(408);
			} else {
				console.log("error occurred", errorTitle, "/color");
				res.sendStatus(500);
			}
		} else {
			led = JSON.parse(body);
			res.status(200).send(led);
		}
	});
}

router.get("/ew", async (req, res) => {
	//TODO parameter with value
	await request.get(baseUrl + "/ew", (err, response, body) => {
		if (err) {
			console.log("error occurred", errorTitle, "/ew");
			res.sendStatus(500);
		} else {
			led.ew = !led.ew;
			res.status(200).send(led);
		}
	});
});

module.exports = router;
