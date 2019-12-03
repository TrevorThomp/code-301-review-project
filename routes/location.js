const express = require('express');
const router = express.Router();
const superagent = require('superagent')
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));


router.get('/', function(request,response){

  // Location Constructor
  function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData.results[0].formatted_address;
    this.latitude = geoData.results[0].geometry.location.lat;
    this.longitude = geoData.results[0].geometry.location.lng;
  }

  Location.prototype.save = function(){
    const SQL = `INSERT INTO location (search_query, formatted_query, latitude, longitude VALUES ($1, $2, $3, $4) RETURNING *`;

    let values = Object.values(this);
    return client.query(SQL, values);
  }

  // API Fetch
  Location.getLocation = function (query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

    return superagent.get(url)
      .then(data => {
        let location = new Location(query, data.body.results[0]);
        return location.save()
          .then(result => {
            location.id = result.rows[0].id;
            return location
          })
      })
      .catch(error => {
        response.status(500).send('Status: 500. Sorry, there is something not quite right');
      })
  }

  // Location SQL lookup
  Location.lookup = (handler) => {
    const SQL = `SELECT * FROM locations WHERE search_query=$1`;
    const values = [handler.query];

    return client.query(SQL, values)
      .then( results => {
        if (results.rowCount > 0){
          handler.cacheHit(results);
        }else {
          handler.cacheMiss();
        }
      })
      .catch(console.error);
  };

  function fetchLocation(request,response) {

    const locationHandler = {
      query: request.query.data,

      cacheHit: (results) => {
        console.log('Got data from DB');
        response.send(results.rows[0]);
      },

      cacheMiss: () => {
        console.log('No data in DB, fetching...');
        Location.fetchLocation(request.query.data)
          .then( data => response.send(data));
      }
    };
    Location.lookup(locationHandler);
  }
})

module.exports = router;
