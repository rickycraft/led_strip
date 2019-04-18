const request = require("request");

const base_request = async function(url, res, success) {
	await request.get(url, { timeout: 1000 }, (err, response, body) => {
		if (err) {
			if (err.code === "ETIMEDOUT") {
				res.sendStatus(408);
			} else {
				res.sendStatus(500);
			}
			console.log("error occurred", errorTitle, msg);
		} else {
			let tmp = JSON.parse(body);
			delete tmp.ew;

			res.status(200).json(success(tmp));
		}
	});
};

const check_params = function(inp, out) {
	for (val in inp) {
		if (inp[val] != null) out[val] = inp[val];
	}
	return out;
};

const map_val = function(x, in_min, in_max, out_min, out_max) {
	i = ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	return Math.round(i);
};

module.exports = {
	request: base_request,
	checkParams: check_params,
	mapValue: map_val,
};
