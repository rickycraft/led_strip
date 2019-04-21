const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const port = 3000;

mongoose.connect("mongodb+srv://ricky:321riccardo@maincluster-ryh3k.mongodb.net/test?retryWrites=true", {
	useNewUrlParser: true,
	useCreateIndex: true,
});

app.use(cors());
app.use(express.json());

app.use("/rgb", require("./api/rgb")); //rgb led strip
app.use("/lamp", require("./api/lamp")); //desk lamp
app.use("/ambient", require("./api/ambient")); //ambient led strip
app.use("/weather", require("./api/weather")); //bme280 sensor

app.listen(port);
