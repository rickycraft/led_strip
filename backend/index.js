const express = require("express");
const cors = require("cors");
const app = express();

const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/rgb", require("./api/rgb")); //rgb led strip
app.use("/lamp", require("./api/lamp")); //desk lamp
app.use("/ambient", require("./api/ambient")); //ambient led strip

app.listen(port);
