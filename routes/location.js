const express = require('express');
const router = express.Router();
const superagent = require('superagent')
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

function Location(query, data){
  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

Location.prototype.save = function(){
  const SQL = `INSERT INTO location
  (search_query, formatted_query, latitude, longitude)
  VALUES ($1, $2, $3, $4)
  RETURNING *`;

  let values = Object.values(this);
  return client.query(SQL, values);
};

router.get('/', function(request,response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  const query = request.query.data;

  return superagent.get(url)
    .then( data => {
      const location = new Location(query, data.body.results[0])
      location.save()
      return location
    })
    .then(data => response.send(data))
    .catch( () => {
      response.status(500).send('Status: 500. Sorry, there is something not quite right');
    })
})

module.exports = router;
