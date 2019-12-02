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

// Routes
app.get('/location', handleLocation)
app.get('/weather', handleWeather)

// Contructors
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

// Fetch Requests
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

function handleWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then( data => {
      const weatherSummaries = data.body.daily.data.map(day => new Weather(day));
      response.status(200).send(weatherSummaries);
    })
    .catch( error => {
      errorHandler('So sorry, something went really wrong', request, response);
    });
}

// Error Handler function to throw
function errorHandler(error,request,response) {
  response.status(500).send(error);
}

// Error if route does not exist
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

// Server Listener
app.listen(PORT, console.log(`Listening on ${PORT}`));
