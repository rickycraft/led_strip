const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const request = require('request');
const app = express();
const port = 3000;

const url = 'http://192.168.1.220';
app.use(cors());
//app.use(bodyParser.json());
app.use(express.json());

app.get('/status', (req, res) => {
    request.get(url+'/status', (err,response,body) => {
        console.log(body);
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(JSON.parse(body));
        }
    })
})

app.post('/rgb', (req,res) => {
    let values = '/rgb/'+req.body.red+':'+req.body.green+':'+req.body.blu+':'+req.body.lux;
    request.get(url+values, (err, response, request) => {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
        }
    }) 
    res.json(req.body);
})


app.listen(port);
