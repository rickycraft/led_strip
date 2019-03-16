const express = require("express");
const cors = require("cors");
//const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const querystring = require('querystring');
const port = 3000;

const baseUrl = 'http://192.168.1.220';
const lampUrl = 'http://192.168.1.225';
app.use(cors());
app.use(express.json());

var led = {
    red: 0,
    green: 0,
    blu: 0,
    lux: 0,
    ew: false,
};

var lamp = {
    status: false,
    lux: 0,
};

app.get('/rgb/status', async (req, res) => {
    await request.get(baseUrl+'/status', {timeout: 500},(err,response,body) => {
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
})

app.get('/rgb/off', async (req, res) => {
    led.lux = 0;
    await setLed(res);
})

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
}

app.get('/ew', async (req,res) => { //TODO parameter with value
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

app.get('/lamp', async (req,res) => {
    await request.get(lampUrl+'/led', (err, response, body) => {
        if(err){
            console.log(err);
            res.sendStatus(500);
        } else {
            lamp = JSON.parse(body);
            res.status(200).send(JSON.parse(body));
        }
    })
})

app.post('/lamp/lux', async (req, res) => {
    lamp.lux = req.body.lux;
    await request.get({ url: lampUrl+'/lux', qs: {lux : lamp.lux}}, (err, response, body) => {
        if(err){
            console.log(err);
            res.sendStatus(500);
        } else {
            lamp = JSON.parse(body);
            console.log(lamp);
            res.status(200).send(JSON.parse(body));
        }
    })    
})

app.get('/lamp/status', async (req, res) => {
    await request.get(lampUrl+'/status', (err, response, body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            lamp = JSON.parse(body);
            res.status(200).send(JSON.parse(body));
        }
    })
})

app.listen(port);
