const express = require('express');
const router = express.Router();
const superagent = require('superagent')

router.get('/', function(request,response) {

  // Weather Constructor
  function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toDateString();
    this.created = Date.now()
  }

  // API Fetch
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then( data => {
      const weatherSummaries = data.body.daily.data.map(day => new Weather(day));
      response.status(200).send(weatherSummaries);
    })
    .catch( error => {
      errorHandler('So sorry, something went really wrong', request, response);
    });
});

module.exports = router;
