const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const std_req = require("../utility").request;
const mapValue = require("../utility").mapValue;

const lampUrl = "http://192.168.1.225";

var lamp = {
	status: false,
	lux: 0,
};

router.get("/toggle", async (req, res) => {
	std_req(lampUrl + "/toggle", res, data => {
		lamp = data;
		return lamp;
	});
});

router.post("/lux", async (req, res) => {
	let params = querystring.stringify({
		lux: mapValue(req.body.lux, 0, 10, 0, 255),
	});
	std_req(lampUrl + "/lux?" + params, res, data => {
		lamp.lux = mapValue(data.lux, 0, 255, 0, 10);
		lamp.status = data.status;
		return lamp;
	});
});

router.get("/status", async (req, res) => {
	std_req(lampUrl + "/status", res, data => {
		data.lux = mapValue(data.lux, 0, 255, 0, 10);
		lamp = data;
		return data;
	});
});

module.exports = router;
