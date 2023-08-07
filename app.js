const express = require("express");
const pool = require("./config/db-pool.js");
const { blackListCheck } = require("./check-ip-black-list.js");
const app = express();
const port = 3000;

// Check IP black list
app.use(async function (req, res, next) {
  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const isBlack = await blackListCheck(clientIP);
  if (isBlack) {
    console.log("블랙IP차단:", clientIP);
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
