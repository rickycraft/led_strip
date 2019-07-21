const request = require("request");

const base_request = (url, res, success) => {
	request.get(url, { timeout: 1000 }, async (err, response, body) => {
		if (err) {
			if (err.code === "ETIMEDOUT") {
				res.sendStatus(408);
			} else {
				res.sendStatus(500);
			}
			console.log("error occurred on ", url);
		} else {
			try {
				let tmp = JSON.parse(body);
				let result = await success(tmp);
				res.status(200).json(result);
			} catch (err) {
				res.status(500).json({
					error: err,
				});
			}
		}
	});
};

const check_params = (inp, out) => {
	for (let val in inp) {
		if (inp[val] != null) out[val] = inp[val];
	}
	return out;
};

const map_val = (x, in_min, in_max, out_min, out_max) => {
	const i = ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	return Math.round(i);
};

module.exports = {
	request: base_request,
	checkParams: check_params,
	mapValue: map_val,
};
