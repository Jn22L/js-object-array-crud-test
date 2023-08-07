const express = require("express");
const app = express();
const port = 3000;

// ip차단 미들웨어
const BLACK_LIST_IP = ["127.0.0.1"];
app.use(function (req, res, next) {
  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (BLACK_LIST_IP.indexOf(clientIP) > -1) {
    console.log("차단:", clientIP);
    req.pause();
    res.status(400).end();
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
