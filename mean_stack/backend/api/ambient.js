const express = require("express");
const router = express.Router();
const request = require("request");

const lampUrl = "http://192.168.1.230";

var lamp = {
  status: false,
  lux: 0,
};

router.get("/toggle", async (req, res) => {
  await request.get(lampUrl + "/toggle", (err, response, body) => {
    if (err) {
      res.sendStatus(500);
    } else {
      lamp = JSON.parse(body);
      res.status(200).send(JSON.parse(body));
    }
  });
});

router.post("/lux", async (req, res) => {
  lamp.lux = mapValue(req.body.lux, 0, 10, 0, 255);
  await request.get({
    url: lampUrl + "/lux",
    qs: {
      lux: lamp.lux
    }
  },
    (err, response, body) => {
      if (err) {
        res.sendStatus(500);
      } else {
        lamp = JSON.parse(body);
        scaled = lamp;
        scaled.lux = mapValue(lamp.lux, 0, 255, 0, 10);
        res.status(200).send(scaled);
      }
    }
  );
});

router.get("/status", async (req, res) => {
  await request.get(lampUrl + "/status", (err, response, body) => {
    if (err) {
      res.sendStatus(500);
    } else {
      lamp = JSON.parse(body);
      res.status(200).send(JSON.parse(body));
    }
  });
});

function mapValue(x, in_min, in_max, out_min, out_max) {
  i = ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return Math.round(i);
}

module.exports = router;