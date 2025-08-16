CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  pen_name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive') DEFAULT 'active',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  cover_image VARCHAR(255),
  release_date DATE,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE book_categories (
  book_id INT,
  category_id INT
);

CREATE TABLE episodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT,
  user_id INT,
  title VARCHAR(255),
  content TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  price INT DEFAULT 1,
  cover VARCHAR(255),
  priority INT DEFAULT 1,
  release_date DATE,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  audio_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  episode_id INT,
  amount INT,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount INT,
  type ENUM('earn', 'spend', 'daily_checkin'),
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  checkin_date DATE NOT NULL,
  UNIQUE KEY unique_user_checkin (user_id, checkin_date)
);

CREATE TABLE audio_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  episodes_id INT NOT NULL,
  status ENUM('pending', 'processing', 'done', 'error') DEFAULT 'pending',
  audio_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);




CREATE TABLE log_api_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_endpoint VARCHAR(255) NOT NULL,
  request_headers TEXT,
  request_payload TEXT,
  response_headers TEXT,
  response_payload TEXT,
  status INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
