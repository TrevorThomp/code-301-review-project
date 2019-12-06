' use strict';

// Application Dependencies
const superagent = require('superagent');
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect()
client.on('err', err => console.error(err));

// Yelp Constructor
function Yelp(data) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created = Date.now()
}

Yelp.prototype.getYelp = function(location) {
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${location.latitude}&longitude=${location.longitude}`;

  return superagent
    .get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const yelpData = result.body.businesses.map(data => {
        const yelpSummary = new Yelp(data);
        yelpSummary.save(location.id)
        return yelpSummary
      })
      return yelpData
    })
}

Yelp.prototype.save = function(locationID) {
  const SQL = `INSERT INTO yelp (name, rating, price, url, image_url, created, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
  const values = Object.values(this);
  values.push(locationID);

  return client.query(SQL, values)
}

Yelp.prototype.lookup = function (table) {
  const SQL = `SELECT * FROM yelp WHERE location_id=$1`;
  const values = [table.location.id]

  return client.query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        table.dataHit(results)
      } else {
        table.dataMiss()
      }
    })
    .catch(err => console.error(err))
}

Yelp.delete = (table, location_id) => {
  const SQL = `DELETE FROM ${table} WHERE location_id=${location_id}`

  return client.query(SQL)
};

Yelp.cacheTime = 864000;

function queryYelp(request,response) {
  const yelp = {
    location: request.query.data,

    dataHit: (results) => {
      let yelpCache = (Date.now() - results.rows[0].created);
      if (yelpCache > Yelp.cacheTime) {
        Yelp.delete('yelp', request.query.data.id)
        this.dataMiss()
      } else {
        response.send(results.rows)
      }
    },
    dataMiss: () => {
      Yelp.prototype.getYelp(request.query.data)
        .then(data => response.send(data))
    }
  }
  Yelp.prototype.lookup(yelp)
}

module.exports = queryYelp;