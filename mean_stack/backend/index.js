const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const port = 3000;

const baseUrl = 'http://192.168.1.220';
app.use(cors());
//app.use(bodyParser.json());
app.use(express.json());

app.get('/status', (req, res) => {
    request.get(baseUrl+'/status', (err,response,body) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
})

app.post('/rgb', (req,res) => {
    new Promise((resolve, reject) => { //creating promise
        request.get( //get params
            baseUrl+'/led/&'+req.body.red+':'+req.body.green+':'+req.body.blu+':'+req.body.lux,
            (err, response, body) => { //get request
                if (response.statusCode == 500) {
                   reject(); //on promise fail
               } else 
                   resolve(body); //on promise success
           })
        }).then(
            (result) => { //if promise success
                //console.log(result);
                res.status(200).send(JSON.parse(result));
            }, () => { //if promise fail
                res.sendStatus(500);
            }
        )
});

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
