// backend/api.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const serverless = require('serverless-http');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware setup
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// User registration route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the username already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash the password and store the new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );

        // Generate a JWT token
        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // Return token and userId to client
        res.status(201).json({ message: 'User registered successfully', token, userId: user.id });
    } catch (err) {
        console.error("Error in registration:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// User login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token and include the user ID
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user.id });
    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Create a new post
app.post('/api/posts', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, req.user.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all posts with author name
app.get('/api/posts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT posts.id, posts.title, posts.content, posts.created_at, posts.author_id, users.username AS author
            FROM posts
            JOIN users ON posts.author_id = users.id
            ORDER BY posts.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a post by ID
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    try {
        const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (postResult.rows.length === 0) return res.status(404).json({ message: 'Post not found' });

        const post = postResult.rows[0];
        if (post.author_id !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this post' });
        }

        const result = await pool.query(
            'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, content, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: 'Server error while updating post', error: err.message });
    }
});

// Delete a post by ID
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (postResult.rows.length === 0) return res.status(404).json({ message: 'Post not found' });

        const post = postResult.rows[0];
        if (post.author_id !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: 'Server error while deleting post', error: err.message });
    }
});

// Export the app wrapped in serverless
module.exports.handler = serverless(app);
