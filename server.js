'use strict';

// dotenv
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent')
const pg = require('pg');

const PORT = process.env.PORT || 3000;

// Router
const location = require('./routes/location')
const weather = require('./routes/weather');

// Database Connection
const client = new pg.Client(process.env.DATABASE_URL);
client.on('err', err => console.error(err));
client.connect();

// Middleware
app.use(cors());
app.use(express.static('front-end'))

app.use('/location', location);
app.use('/weather', weather);

// Error Handler function to throw
function errorHandler(error,request,response) {
  response.status(500).send(error);
}

// Error if route does not exist
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

// Server Listener
app.listen(PORT, console.log(`Listening on ${PORT}`));
