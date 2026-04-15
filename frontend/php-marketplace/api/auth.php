<?php
/**
 * Authentication Functions
 */

/**
 * Register a new user
 */
function registerUser($name, $email, $password) {
    $conn = getDBConnection();

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :password)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->execute();

        return $conn->lastInsertId();
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Login user
 */
function loginUser($email, $password) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }

        return false;
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Get user by ID
 */
function getUserById($userId) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("SELECT id, name, email, avatar, bio, location, created_at FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Update user profile
 */
function updateUserProfile($userId, $name, $email, $bio, $location) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("UPDATE users SET name = :name, email = :email, bio = :bio, location = :location WHERE id = :id");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':bio', $bio);
        $stmt->bindParam(':location', $location);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();

        return true;
    } catch(PDOException $e) {
        return false;
    }
}
?>
