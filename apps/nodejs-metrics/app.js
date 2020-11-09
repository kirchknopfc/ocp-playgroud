'use strict';
const path = require('path');
const express = require('express');
const morgan = require('morgan');

// Env Variabels
const port = process.env.PORT || "8080";
const metricsFile = process.env.METRICS_FILE || 'metrics/prometheus.txt';
const metricsUrl = process.env.METRICS_URL || '/actuator/prometheus';
const hostname = process.env.HOSTNAME;

// APP
const app = express();

// Logging
app.use(morgan('combined'))

// Root
app.get('/', function (req, res) {
  res.send('<h1>nodejs metrics sample app</h1><h3>' + hostname + '</h3><a href="./actuator/prometheus">metrics<a/><br><a href="./env">env<a/>');
});

// env
app.get('/env', function (req, res) {
  res.setHeader('content-type', 'application/json');
  res.send(process.env);
});

// metrics
app.use(metricsUrl, express.static(path.join(__dirname, metricsFile)));

// Start Server
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});