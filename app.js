const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the SQLite database
const db = new sqlite3.Database('moviesData.db');

// Create the 'movie' table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS movie (
      movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
      director_id INTEGER,
      movie_name TEXT,
      lead_actor TEXT
    )
  `);

  // Create the 'director' table
  db.run(`
    CREATE TABLE IF NOT EXISTS director (
      director_id INTEGER PRIMARY KEY AUTOINCREMENT,
      director_name TEXT
    )
  `);
});

app.use(express.json());

// API 1: Get All Movie Names
app.get('/movies', (req, res) => {
  db.all('SELECT movie_name FROM movie', (err, movies) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      const movieNames = movies.map((movie) => movie.movie_name);
      res.json(movieNames);
    }
  });
});

// API 2: Create Movie
app.post('/movies', (req, res) => {
  const { leadActor } = req.body;

  db.run('INSERT INTO movie (lead_actor) VALUES (?)', [leadActor], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Movie Successfully Added');
    }
  });
});

// API 3: Get Movie by ID
app.get('/movies/:movieId', (req, res) => {
  const { movieId } = req.params;

  db.get('SELECT * FROM movie WHERE movie_id = ?', [movieId], (err, movie) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else if (!movie) {
      res.status(404).send('Movie Not Found');
    } else {
      res.json(movie);
    }
  });
});

// API 4: Update Movie by ID
app.put('/movies/:movieId', (req, res) => {
  const { movieId } = req.params;
  const { leadActor } = req.body;

  db.run('UPDATE movie SET lead_actor = ? WHERE movie_id = ?', [leadActor, movieId], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Movie Details Updated');
    }
  });
});

// API 5: Delete Movie by ID
app.delete('/movies/:movieId', (req, res) => {
  const { movieId } = req.params;

  db.run('DELETE FROM movie WHERE movie_id = ?', [movieId], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Movie Removed');
    }
  });
});

// API 6: Get All Directors
app.get('/directors', (req, res) => {
  db.all('SELECT director_name FROM director', (err, directors) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(directors);
    }
  });
});

// API 7: Get Movies by Director ID
app.get('/directors/:directorId/movies', (req, res) => {
  const { directorId } = req.params;

  db.all('SELECT movie_name FROM movie WHERE director_id = ?', [directorId], (err, movies) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      const movieNames = movies.map((movie) => movie.movie_name);
      res.json(movieNames);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express instance
module.exports = app;



