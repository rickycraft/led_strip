const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
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
};

var elwire = false;

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
    console.log("status requested");
})

app.post('/rgbl', (req,res) => {
    led = req.body;
    setLed();
    
})

app.post('/lux', async (req, res) => {
    led.lux = req.body;
    setLed();
})

app.post('/rgb', async (req, res) => {
    led.red = req.body.red;
    led.green = req.body.green;
    led.blu = req.body.blu;
    setLed();
})

async function setLed(){
    await request.get(
        baseUrl+'/led/&'+checkColor(led.red)+':'+checkColor(led.green)+':'+checkColor(led.blu)+':'+checkColor(led.lux),
        (err, response, body) => { //get request
            if (response.statusCode == 500) {
                res.sendStatus(500); 
           } else{ 
                res.status(200).send(JSON.parse(body));
                 
           } 
       });
    console.log("rgb request");
    console.log(led);
}

function checkColor(color){
    if (color<10){
        return "0"+color;
    } else {
        return color;
    }
}

app.post('/elwire', async (req,res) => {
    await request.get(baseUrl+'/elwire', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
    elwire = !elwire;
    console.log(elwire);
})

app.listen(port);
