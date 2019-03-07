const express = require("express");
const cors = require("cors");
//const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const querystring = require('querystring');
const port = 3000;

const baseUrl = 'http://192.168.1.220';
app.use(cors());
app.use(express.json());

var led = {
    red: 0,
    green: 0,
    blu: 0,
    lux: 0
};

var ew = false;

app.get('/status', async (req, res) => {
    await getRequest('/status', res);
})

app.get('/rgb/off', async (req, res) => {
    led.lux = 0;
    await setLed(res);
})

async function getRequest(url, res){
    await request.get(baseUrl+url, {timeout: 10000},(err,response,body) => {
        if (err) {
            if (err.code === 'ETIMEDOUT'){
                console.log("timeout error ");
                res.sendStatus(408);
            } else {
                console.log("error occurred");
                res.sendStatus(500);
            }
        } else {
            led = JSON.parse(body);
            res.status(200).json(led);
        }
    })
}

app.post('/rgb', async (req, res) => {
    (req.body.red != null) ? led.red = req.body.red : '' ;
    (req.body.green != null) ? led.green = req.body.green : '';
    (req.body.blu != null) ? led.blu = req.body.blu : '';
    (req.body.lux != null) ? led.lux = req.body.lux : '';
    await setLed(res);
})

async function setLed(res){
    console.log(led);
    let params = querystring.stringify(led);
    //console.log(baseUrl+'/led?'+params);
    await request.get(
        baseUrl+'/led?'+params,
        (err, response, body) => { //get request
            if (!response) {
                console.log("response undefined");
                res.sendStatus(500);
            } else if (err) {
                if (err.code === 'ETIMEDOUT'){
                    console.log("timeout error ");
                    res.sendStatus(408);
                } else {
                    console.log("error occurred");
                    res.sendStatus(500);
                }
            } else{ 
                res.status(200).send(JSON.parse(body));
            } 
       });
    //console.log("rgb request ", led);
}

app.get('/ew', async (req,res) => {
    await request.get(baseUrl+'/ew', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
    ew = !ew;
    console.log(ew);
})

app.listen(port);
