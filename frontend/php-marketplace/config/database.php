<?php
/**
 * Database Configuration
 *
 * Update these credentials for your MySQL database
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'campus_market');
define('DB_USER', 'root');
define('DB_PASS', '');

/**
 * Create database connection
 */
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
            DB_USER,
            DB_PASS
        );
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

/**
 * Database Schema
 * Run this SQL in your MySQL database to create tables:
 *
 * CREATE DATABASE campus_market;
 * USE campus_market;
 *
 * CREATE TABLE users (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     name VARCHAR(255) NOT NULL,
 *     email VARCHAR(255) UNIQUE NOT NULL,
 *     password VARCHAR(255) NOT NULL,
 *     avatar VARCHAR(255),
 *     bio TEXT,
 *     location VARCHAR(255),
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * CREATE TABLE categories (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     name VARCHAR(100) NOT NULL,
 *     slug VARCHAR(100) UNIQUE NOT NULL,
 *     icon VARCHAR(10),
 *     description TEXT,
 *     product_count INT DEFAULT 0
 * );
 *
 * CREATE TABLE products (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     user_id INT NOT NULL,
 *     name VARCHAR(255) NOT NULL,
 *     description TEXT,
 *     price DECIMAL(10, 2) NOT NULL,
 *     category_id INT,
 *     condition VARCHAR(50),
 *     status ENUM('active', 'sold', 'inactive') DEFAULT 'active',
 *     views INT DEFAULT 0,
 *     featured BOOLEAN DEFAULT FALSE,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 *     FOREIGN KEY (category_id) REFERENCES categories(id)
 * );
 *
 * CREATE TABLE product_images (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     product_id INT NOT NULL,
 *     image_url VARCHAR(500) NOT NULL,
 *     is_primary BOOLEAN DEFAULT FALSE,
 *     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
 * );
 *
 * CREATE TABLE messages (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     product_id INT NOT NULL,
 *     sender_id INT NOT NULL,
 *     receiver_id INT NOT NULL,
 *     message TEXT NOT NULL,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
 *     FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
 *     FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
 * );
 */
?>
