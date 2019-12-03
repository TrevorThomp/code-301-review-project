const express = require('express');
const router = express.Router();
const superagent = require('superagent')

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

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

router.get('/', handleLocation)

module.exports = router;
