const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const port = 3000;

const baseUrl = 'http://192.168.1.220';
app.use(cors());
app.use(express.json());

app.get('/status', async (req, res) => {
    await request.get(baseUrl+'/status', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
    console.log("status requested");
})

app.post('/rgb', async (req,res) => {
    await request.get(
        baseUrl+'/led/&'+checkColor(req.body.red)+':'+checkColor(req.body.green)+':'+checkColor(req.body.blu)+':'+checkColor(req.body.lux),
        (err, response, body) => { //get request
            if (response.statusCode == 500) {
                res.sendStatus(500); 
           } else{ 
                res.status(200).send(JSON.parse(body));
                 
           } 
       });
    console.log("rgb request");
})

function checkColor(color){
    if (color<10){
        return "0"+color;
    } else {
        return color;
    }
}

app.post('/elwire', (req,res) => {
    request.get(baseUrl+'/elwire', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
})

app.listen(port);
