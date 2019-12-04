'use strict';

require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// Location Constructor
function Location(query, data){
  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

// Google Geocode API Fetch
Location.getLocation = function (request,response){
  const query = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent
    .get(url)
    .then( result=> {
      let location = new Location(query, result.body.results[0]);
      return location.save()
        .then(data => response.send(location))
    });
};

Location.prototype.save = function() {
  const SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *`;

  let values = Object.values(this);
  return client.query(SQL, values)
    .then(data => console.log('success'))
};

// Export Location API Fetch
module.exports = Location.getLocation;
