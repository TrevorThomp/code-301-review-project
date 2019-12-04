'use strict';

// dotenv
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// Router
const getLocation = require('./routes/location')
const getWeather = require('./routes/weather');

// Middleware
app.use(cors());
app.use(express.static('front-end'))


app.get('/location', getLocation);
app.get('/weather', getWeather);

// Error Handler function to throw
function errorHandler(error,request,response) {
  response.status(500).send(error);
}

// Error if route does not exist
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

// Server Listener
app.listen(PORT, console.log(`Listening on ${PORT}`));
