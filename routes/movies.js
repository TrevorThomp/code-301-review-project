'use strict';

require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

function Movies(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
  this.created = Date.now();
}

Movies.prototype.getMovie = function(location) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&include_adult=false&query=${location.search_query}`;

  return superagent
    .get(url)
    .then(result => {
      const movieData = result.body.results.map(title => {
        const movieSummary = new Movies(title);
        movieSummary.save(location.id)
        return movieSummary;
      })
      return movieData;
    })
}

Movies.prototype.save = function(locationID) {
  const SQL = `INSERT INTO movies (title, overview, average_votes, total_votes, image_url, popularity, released_on, created, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
  const values = Object.values(this);
  values.push(locationID);

  return client.query(SQL,values)
}

Movies.prototype.lookup = function(table) {
  const SQL = `SELECT * FROM movies WHERE location_id=$1`;
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

Movies.delete = (table, location_id) => {
  const SQL = `DELETE FROM ${table} WHERE location_id=${location_id}`;

  return client.query(SQL)
}

Movies.cacheTime = 864000;

function queryMovies(request,response) {
  const movies = {
    location: request.query.data,

    dataHit: (results) => {
      let movieCache = (Date.now() - results.rows[0].created);
      if (movieCache > Movies.cacheTime) {
        Movies.delete('movies', request.query.data.id)
        this.dataMiss()
      } else {
        response.send(results.rows)
      }
    },
    dataMiss: () => {
      Movies.prototype.getMovie(request.query.data)
        .then(data => response.send(data))
    }
  }

  Movies.prototype.lookup(movies)
}

module.exports = queryMovies;
