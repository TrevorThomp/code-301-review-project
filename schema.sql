DROP TABLE IF EXISTS locations, weather, movies;

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
  FOREIGN KEY (location_id) REFERENCES locations (id)
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
    created VARCHAR(255)
    FOREIGN KEY (location_id) REFERENCES locations (id)
  );