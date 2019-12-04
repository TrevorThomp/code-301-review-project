'use strict';

require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const pg = require('pg');

// Connects to PSQL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));