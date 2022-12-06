import mysql from "mysql2";
import mqtt from "mqtt";
import express from "express";
import cors from "cors";

let temp = undefined;
let humid = undefined;

const conn = mysql.createConnection({
  host: "localhost",
  database: "node-test",
  user: "root",
  password: ""
});

conn.connect();

//Server information
const client = mqtt.connect(
  "mqtt://mqtt.school.stanvdwiel.nl",
  {
    username: "esp32",
    password: "Welbeeing!"
  }
);

//Connect to the broker
client.on("connect", function () {
  client.subscribe("presence", function (err) {
    if (err) throw err;
    console.log("connected to the broker");
  });

  client.subscribe("sensors/dht/temperature");
  client.subscribe("sensors/dht/humidity");
});

client.on("message", function (topic, message) {
  switch (topic) {
    case "sensors/dht/temperature":
      console.log("Temp: %s", message.toString());
      temp = message;
      break;
    case "sensors/dht/humidity":
      console.log("Humid: %s", message.toString());
      humid = message;
      break;
  }

  if (!(temp && humid)) return;

  console.log("Received both temp and humid");

  temp = undefined;
  humid = undefined;
})

//Necessary to start the server
const app = express();
app.use(express.json());
app.use(cors());

//Data included in the server
app.get("/beehive", function (req, res) {
  conn.query('SELECT * FROM `beehiveentry`;',
    function (err, result) {
      if (err) {
        res.status("500").json({
          message: err
        });

        return;
      } 

      res.json(result);
    });
});

// als er een post request wordt gestuurd naar
// /beehive, dan voegen we een beehiveentry toe aan
// de database
app.post("/beehive", function (req, res) {
  conn.execute(
    "INSERT INTO beehiveentry (temp, humidity) VALUES (?, ?);",
    [req.body.temp, req.body.humidity],
    function (err, result) {
      if (err) {
        res.status("500").json({
          message: err
        });

        return;
      }

      res.json(result);
    }
  )
});

//Listens on port 3000 for connections
app.listen(3000, function () {
  console.log("API listening on port 3000");
});

