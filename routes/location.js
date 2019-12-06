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
Location.prototype.getLocation = function (query){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent
    .get(url)
    .then( result=> {
      let location = new Location(query, result.body.results[0]);
      return location.save()
        .then(result => {
          location.id = result.rows[0].id;
          return location
        })
    });
};

Location.prototype.save = function() {
  const SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *`;

  let values = Object.values(this);
  return client.query(SQL, values)
};

Location.prototype.lookup = function(table) {
  const SQL = `SELECT * FROM locations WHERE search_query=$1`;
  const values = [table.query];

  return client.query(SQL,values)
    .then(results => {
      if (results.rowCount > 0) {
        table.dataHit(results)
      } else {
        table.dataMiss()
      }
    })
    .catch(err => console.error(err))
}

function queryLocation(request,response) {
  const location = {
    query : request.query.data,

    dataHit: (results) => {
      response.send(results.rows[0]);
    },
    dataMiss: () => {
      Location.prototype.getLocation(request.query.data)
        .then(data => response.send(data))
    }
  }

  Location.prototype.lookup(location)
}

// Export Location API Fetch
module.exports = queryLocation;
