# Blog Project

A blog project built with Node.js, Express, and PostgreSQL, with a front-end interface using HTML, jQuery, and Bootstrap. Users can register, log in, create posts, and edit/delete their own posts.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [File Structure](#file-structure)

## Features
- User Registration and Login
- JWT Authentication
- CRUD operations for blog posts (Create, Read, Update, Delete)
- Only post owners can edit or delete their posts
- Front-end interface with Bootstrap and jQuery

## Installation

### Prerequisites
- Node.js and npm
- PostgreSQL

## Installing PostgreSQL on macOS and Running as a Service

Follow these steps to install PostgreSQL on your Mac and set it up to run as a service.

### Step 1: Install PostgreSQL
You can install PostgreSQL on macOS using Homebrew. If you don’t have Homebrew installed, you can install it first by running:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Once Homebrew is installed, use it to install PostgreSQL:
```bash
brew install postgresql
```

### Step 2: Start PostgreSQL as a Service
To start PostgreSQL and have it automatically start on boot, you can run the following commands:
```bash
brew services start postgresql
```

This will start the PostgreSQL server and set it to start on system boot.

### Step 3: Verify PostgreSQL Installation
You can check if PostgreSQL is running by connecting to the default PostgreSQL database:
```bash
psql postgres
```

If PostgreSQL is running, this command will open the PostgreSQL prompt. You can exit by typing:
```sql
\q
```

### Step 4: Manage PostgreSQL Service
You can stop, restart, or view the status of the PostgreSQL service with the following commands:

- **Stop PostgreSQL**:
  ```bash
  brew services stop postgresql
  ```

- **Restart PostgreSQL**:
  ```bash
  brew services restart postgresql
  ```

- **Check PostgreSQL Status**:
  ```bash
  brew services list
  ```

### Step 5: Create a PostgreSQL User and Database
After installation, you can create a new PostgreSQL user and database for your project. Open the PostgreSQL prompt:
```bash
psql postgres
```

Create a user and a database with the following commands:
```sql
CREATE USER your_username WITH PASSWORD 'your_password';
CREATE DATABASE blog_app OWNER your_username;
GRANT ALL PRIVILEGES ON DATABASE blog_app TO your_username;
```

Replace `your_username` and `your_password` with your desired credentials. Exit the prompt with:
```sql
\q
```

Your PostgreSQL setup is now complete and running as a service on your Mac.


### Clone the Repository
```bash
git clone https://github.com/your-username/blog-project.git
cd blog-project
```

### Install Dependencies
```bash
cd backend
npm install
```

## Database Setup
Create a PostgreSQL database and use the provided `database.sql` file to set up the required tables.

1. **Create Database**:
   ```sql
   CREATE DATABASE blog_app;
   ```

2. **Connect to the Database**:
   ```bash
   psql -U your_postgres_user -d blog_app
   ```

3. **Run the SQL Script**:
   ```sql
   \i path/to/database.sql
   ```
   Ensure `database.sql` is in the same directory or provide the correct path.

The `database.sql` file should contain the following SQL commands:

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Posts Table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Configuration
Update your `.env` file with the correct database configuration. See [Environment Variables](#environment-variables) for more details.

## Environment Variables
Create a `.env` file in the `backend` directory and add the following environment variables:

```plaintext
PORT=5001
PG_USER=your_postgres_user
PG_PASSWORD=your_postgres_password
PG_HOST=localhost
PG_DATABASE=blog_app
PG_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

### Start the Server
In the `backend` directory, run:
```bash
node server.js
```
The server will start on `http://localhost:5001`.

## Usage

### Front-End Files
- Place all front-end HTML files (like `index.html`, `register.html`, etc.) in the `public` folder within the root directory.

### Access the Application
1. Open `index.html` to view the main blog page.
2. You can register a new user using `register.html`.
3. After registering, the user will be logged in automatically, and the app will redirect to `index.html`.
4. Users can create new posts, and only the post owners will have access to **Edit** and **Delete** options.

## File Structure
Here’s a quick overview of the file structure:
```
blog-project/
├── backend/
│   ├── server.js        # Main server file
│   ├── database.sql     # Database setup script
│   ├── .env             # Environment variables
│   └── node_modules/    # Node dependencies
├── public/
│   ├── index.html       # Main blog page
│   ├── register.html    # Registration page
│   ├── login.html       # Login page
│   ├── create-post.html # Create new post page
│   └── ...              # Other front-end files (CSS, JS, etc.)
└── ...
```

## API Endpoints

### User Authentication
- **POST** `/api/register`: Register a new user
- **POST** `/api/login`: Log in an existing user

### Blog Posts
- **POST** `/api/posts`: Create a new post (requires authentication)
- **GET** `/api/posts`: Retrieve all posts
- **PUT** `/api/posts/:id`: Update a post by ID (requires ownership and authentication)
- **DELETE** `/api/posts/:id`: Delete a post by ID (requires ownership and authentication)

## Notes
- Ensure your PostgreSQL server is running before starting the Node.js server.
- The server will listen on port `5001` by default, as specified in the `.env` file.