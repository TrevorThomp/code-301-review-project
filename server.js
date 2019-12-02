'use strict';

// dotenv
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent')

const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.static('front-end'))

// Contructors
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

// Routes
app.get('/location', handleLocation)

function handleLocation(request,response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then(data => {
      const geoData = data.body;
      const location = new Location(request.query.data, geoData);
      response.send(location)
    })
    .catch(error => {
      response.status(500).send('Status: 500. Sorry, there is something not quite right');
    })
}

// Error if route does not exist
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

// Server Listener
app.listen(PORT, console.log(`Listening on ${PORT}`));
