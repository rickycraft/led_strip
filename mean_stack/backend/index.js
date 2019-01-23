const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

var messages = {
    "first" : "hello 1",
    "second" : "hello 2"
}

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(messages);
})

app.listen(port);
