const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'booksDB',
  password: 'Cel@123',
  port: 5432,
});

app.use(bodyParser.json());

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS authors (
        author_id SERIAL PRIMARY KEY,
        author_name VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        book_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author_id INT REFERENCES authors(author_id),
        publication_year INT
      );
    `);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

createTables();

app.get('/authors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM authors');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching authors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/books', async (req, res) => {
    try {
      const innerJoinResult = await pool.query(`
        SELECT 
          books.book_id,
          books.title,
          books.publication_year,
          authors.author_name
        FROM books
        INNER JOIN authors ON books.author_id = authors.author_id
        ORDER BY books.publication_year;
      `);
  
      const leftJoinResult = await pool.query(`
        SELECT 
          books.book_id,
          books.title,
          books.publication_year,
          authors.author_name
        FROM books
        LEFT JOIN authors ON books.author_id = authors.author_id
        ORDER BY books.publication_year;
      `);
  
      const rightJoinResult = await pool.query(`
        SELECT 
          books.book_id,
          books.title,
          books.publication_year,
          authors.author_name
        FROM books
        RIGHT JOIN authors ON books.author_id = authors.author_id
        ORDER BY books.publication_year;
      `);
  
      const fullJoinResult = await pool.query(`
        SELECT 
          books.book_id,
          books.title,
          books.publication_year,
          authors.author_name
        FROM books
        FULL JOIN authors ON books.author_id = authors.author_id
        ORDER BY books.publication_year;
      `);
  
      res.json({
        innerJoin: innerJoinResult.rows,
        leftJoin: leftJoinResult.rows,
        rightJoin: rightJoinResult.rows,
        fullJoin: fullJoinResult.rows,
      });
    } catch (err) {
      console.error('Error fetching books with joins:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
