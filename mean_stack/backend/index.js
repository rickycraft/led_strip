const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/status', (req, res) => {
    request.get('http://192.168.1.220/status', (err,response,body) => {
        console.log(body);
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
})

app.post('/&&R=:redG=:grenbB=blu:L=:lux', (req,res) => {
    let red = req.params.red;
    let green = req.params.green;
    let blu = req.params.blu;
    let lux = req.params.lux;

})


app.listen(port);
