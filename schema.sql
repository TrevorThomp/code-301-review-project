DROP TABLE IF EXISTS locations, weather, movies, trails;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7)
  );

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time VARCHAR(255),
  created VARCHAR(255),
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    overview VARCHAR(1000),
    average_votes NUMERIC(4,2),
    total_votes INTEGER,
    image_url VARCHAR(255),
    popularity NUMERIC(6,4),
    released_on CHAR(10),
    created VARCHAR(255),
    location_id INTEGER NOT NULL REFERENCES locations(id)
  );

CREATE TABLE yelp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url VARCHAR(255),
  price VARCHAR(255),
  rating NUMERIC(2,1),
  image_url VARCHAR(255),
  created VARCHAR(255),
  location_id INTEGER NOT NULL REFERENCES locations(id)
)

CREATE TABLE trails (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  length VARCHAR(255),
  stars NUMERIC(2,1),
  star_votes INTEGER,
  summary VARCHAR(255),
  trail_url VARCHAR(255),
  conditions TEXT,
  condition_date VARCHAR(255),
  condition_time VARCHAR(255),
  created VARCHAR(255),
  location_id INTEGER NOT NULL REFERENCES locations(id)
)