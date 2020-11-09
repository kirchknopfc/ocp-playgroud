'use strict';
const path = require('path');
const express = require('express');

// Constants
const port = process.env.PORT || "8080";

// APP
const app = express();
app.get('/', function (req, res) {
  res.send('<h1>NodeJs Metrics Sample App</h1><br><a href="./actuator/prometheus">metrics<a/><br><a href="./env">env<a/>');
});

// env
app.get('/env', function (req, res) {
  res.setHeader('content-type', 'application/json');
  res.send(process.env);
});

// prometheus metrics
app.use('/actuator/prometheus', express.static(path.join(__dirname, 'metrics/prometheus.txt')));

// Start Server
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});