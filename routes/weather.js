require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// Weather Constructor
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
  this.created = Date.now()
}

// API Fetch
Weather.prototype.getWeather = function(location) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${location.latitude},${location.longitude}`;

  superagent.get(url)
    .then( data => {
      const weatherSummaries = data.body.daily.data.map(day => {
        const daySummary = new Weather(day);
        daySummary.save(location.id);
        return daySummary;
      });
      return weatherSummaries;
    })
    .catch( error => console.error(error));
}

Weather.prototype.save = function(locationID) {
  const SQL = `INSERT INTO weather (forecast, time, created, location_id) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = Object.values(this);
  values.push(locationID);

  return client.query(SQL,values);
}

Weather.prototype.lookup = function(table) {
  const SQL = `SELECT * FROM weather WHERE location_id=$1`;
  const values = [table.location.id];

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

function queryWeather(request,response) {
  const weather = {
    location: request.query.data,

    dataHit: (results) => {
      console.log('got weather from DB')
      response.send(results.rows);
    },
    dataMiss: () => {
      console.log('fetching')
      Weather.prototype.getWeather(request.query.data)
        .then(data => console.log(data))
    }
  }
  Weather.prototype.lookup(weather)
}


module.exports = queryWeather;
