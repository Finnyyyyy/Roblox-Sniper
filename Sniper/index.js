const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let queue = [];

app.post("/message", (req, res) => {
    queue.push(req.body);
    console.log("Received:", req.body);
    res.send("OK");
});

app.get("/next", (req, res) => {
    if (queue.length > 0) {
        res.json(queue.shift());
    } else {
        res.json(null);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bridge running on port ${port}`));
