<?php
/**
 * Product Management Functions
 */

/**
 * Get all products with optional filters
 */
function getProducts($category = null, $search = null, $limit = null) {
    $conn = getDBConnection();

    $sql = "SELECT p.*, u.name as seller_name, c.name as category_name
            FROM products p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'active'";

    if ($category) {
        $sql .= " AND c.slug = :category";
    }

    if ($search) {
        $sql .= " AND p.name LIKE :search";
    }

    $sql .= " ORDER BY p.created_at DESC";

    if ($limit) {
        $sql .= " LIMIT :limit";
    }

    try {
        $stmt = $conn->prepare($sql);

        if ($category) {
            $stmt->bindParam(':category', $category);
        }

        if ($search) {
            $searchTerm = "%$search%";
            $stmt->bindParam(':search', $searchTerm);
        }

        if ($limit) {
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        return [];
    }
}

/**
 * Get product by ID
 */
function getProductById($productId) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("
            SELECT p.*, u.name as seller_name, u.email as seller_email,
                   u.avatar as seller_avatar, c.name as category_name
            FROM products p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = :id
        ");
        $stmt->bindParam(':id', $productId);
        $stmt->execute();

        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        // Increment view count
        if ($product) {
            incrementProductViews($productId);
        }

        return $product;
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Create new product
 */
function createProduct($userId, $name, $description, $price, $categoryId, $condition) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("
            INSERT INTO products (user_id, name, description, price, category_id, condition)
            VALUES (:user_id, :name, :description, :price, :category_id, :condition)
        ");
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':category_id', $categoryId);
        $stmt->bindParam(':condition', $condition);
        $stmt->execute();

        return $conn->lastInsertId();
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Update product
 */
function updateProduct($productId, $name, $description, $price, $categoryId, $condition) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("
            UPDATE products
            SET name = :name, description = :description, price = :price,
                category_id = :category_id, condition = :condition
            WHERE id = :id
        ");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':category_id', $categoryId);
        $stmt->bindParam(':condition', $condition);
        $stmt->bindParam(':id', $productId);
        $stmt->execute();

        return true;
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Delete product
 */
function deleteProduct($productId, $userId) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $productId);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        return true;
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Increment product views
 */
function incrementProductViews($productId) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("UPDATE products SET views = views + 1 WHERE id = :id");
        $stmt->bindParam(':id', $productId);
        $stmt->execute();

        return true;
    } catch(PDOException $e) {
        return false;
    }
}

/**
 * Get user's products
 */
function getUserProducts($userId) {
    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.user_id = :user_id
            ORDER BY p.created_at DESC
        ");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        return [];
    }
}
?>
