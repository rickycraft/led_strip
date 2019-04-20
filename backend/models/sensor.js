const mongoose = require("mongoose");

const sensorSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	date: Date,
	temp: Number,
	humi: Number,
	bar: Number,
});

module.exports = mongoose.model("Sensor", sensorSchema);
