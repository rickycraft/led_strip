const mongoose = require("mongoose");

const sensorSchema = mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		date: { type: Date, default: new Date() },
		temp: Number,
		humi: Number,
		bar: Number,
	},
	{ versionKey: false }
);

sensorSchema.index({ date: -1 });

module.exports = mongoose.model("Sensor", sensorSchema);
