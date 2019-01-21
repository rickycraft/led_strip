const express = require("express");
const app = express();
const port = 3000;

var messages = {
    "first" : "hello 1",
    "second" : "hello 2"
}

app.get('/', (req, res) => {
    res.send(messages);
})

app.listen(port);