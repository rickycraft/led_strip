const express = require("express");
const cors = require("cors");
//const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const port = 3000;

const baseUrl = 'http://192.168.1.220';
app.use(cors());
app.use(express.json());

var led = {
    red: 0,
    green: 0,
    blu: 0,
    lux: 0,
    ew: false
};

app.get('/status', async (req, res) => {
    await request.get(baseUrl+'/status', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            led = JSON.parse(body);
            res.status(200).send(body);
        }
    })
    //console.log("status requested");
})

app.post('/rgb', async (req, res) => {
    (req.body.red != null) ? led.red = req.body.red : '' ;
    (req.body.green != null) ? led.green = req.body.green : '';
    (req.body.blu != null) ? led.blu = req.body.blu : '';
    (req.body.lux != null) ? led.lux = req.body.lux : '';
    setLed(res);
})

async function setLed(res){
    await request.get(
        baseUrl+'/led/&'+checkValue(led.red)+':'+checkValue(led.green)+':'+checkValue(led.blu)+':'+checkValue(led.lux),
        (err, response, body) => { //get request
            if (response.statusCode == 500) {
                res.sendStatus(500); 
           } else{ 
                res.status(200).send(JSON.parse(body));
                 
           } 
       });
    console.log("rgb request ", led);
}

function checkValue(color){
    if (color<10){
        return "0"+color;
    } else {
        return color;
    }
}

app.post('/ew', async (req,res) => {
    await request.get(baseUrl+'/ew', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
    led.ew = !led.ew;
    console.log(led.ew);
})

app.listen(port);
