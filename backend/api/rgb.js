const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const request = require("request");
const std_req = require("../utility").request;
const checkParams = require("../utility").checkParams;

const baseUrl = "http://192.168.1.220";

var led = {
	red: 0,
	green: 0,
	blu: 0,
	lux: 0,
};

var ew = false;

router.get("/status", async (req, res) => {
	std_req(baseUrl + "/status", res, data => {
		led = data;
		return data;
	});
});

router.get("/off", async (req, res) => {
	led.lux = 0;
	setLed(res);
});

router.post("/color", async (req, res) => {
	checkParams(req.body, led);
	setLed(res);
});

function setLed(res) {
	let params = querystring.stringify(led); //stringify parameters
	std_req(baseUrl + "/led?" + params, res, data => {
		console.log(data);
		led = data;
		return data;
	});
}

router.get("/ew", async (req, res) => {
	//TODO parameter with value
	std_req(baseUrl + "/ew", res, data => {
		ew = !ew;
		return data;
	});
});
module.exports = router;
