'use strict';

require('dotenv').config();

// Application Dependencies
const superagent = require('superagent')
const pg = require('pg')

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL)
client.connect()
client.on('err', err => console.error(err));

function Trail(data) {
  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.star_votes;
  this.summary = data.summary;
  this.trail_url = data.trail_url;
  this.conditions = data.conditions;
  this.condition_date = data.condition_date;
  this.condition_time = data.condition_time;
  this.created = Date.now();
}

Trail.prototype.getTrail = function(location) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&key=${process.env.TRAIL_API_KEY}`;

  return superagent
    .get(url)
    .then(result => {
      const trailData = result.body.trails.map(data => {
        const trailSummary = new Trail(data);
        trailSummary.save(location.id)
        return trailSummary;
      })
      return trailData;
    })
}

Trail.prototype.save = function(locationID) {
  const SQL = `INSERT INTO trails (name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time, created, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

  const values = Object.values(this);
  values.push(locationID);

  return client.query(SQL, values)
};

Trail.prototype.lookup = function(table) {
  const SQL = `SELECT * FROM trails WHERE location_id=$1`;
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
};

Trail.delete = (table, location_id) => {
  const SQL = `DELETE FROM ${table} WHERE location_id=${location_id}`;

  return client.query(SQL)
}

Trail.cacheTime = 864000;

function queryTrails(request,response) {
  const trails = {
    location: request.query.data,

    dataHit: (results) => {
      let trailCache = (Date.now() - results.rows[0].created)
      if (trailCache > Trail.cacheTime) {
        Trail.delete('trails', request.query.data.id)
        this.dataMiss()
      } else {
        response.send(results.rows)
      }
    },
    dataMiss: () => {
      Trail.prototype.getTrail(request.query.data)
        .then(data => response.send(data))
    }
  }
  Trail.prototype.lookup(trails)
}

module.exports = queryTrails;
