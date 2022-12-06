import mqtt from "mqtt";
import express from "express";
import cors from "cors";

const client = mqtt.connect("mqtt://mqtt.school.stanvdwiel.nl", {
  username: "esp32",
  password: "Welbeeing!"
});

client.on("connect", function () {
  client.subscribe("presence", function (error) {
    if (error) {
      throw error;
    }
    console.log("connected to the broker");
  });
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", function(req, res){
  res.json({
    id: 1,
    beehivelocation: "Amsterdam Zuid",
    temp: 2,
    humidity: 6,
  });
});

app.listen(3000);