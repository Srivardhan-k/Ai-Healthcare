<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Handle product submission
    // In production, save to database
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Product - CampusMarket</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <div class="container add-product-container">
        <div class="page-header">
            <h1>Add New Product</h1>
            <p>List your item for sale</p>
        </div>

        <form method="POST" enctype="multipart/form-data" class="product-form">
            <!-- Images Upload -->
            <div class="form-section">
                <label>Product Images</label>
                <div class="image-upload-grid">
                    <div class="upload-box" onclick="document.getElementById('fileInput').click()">
                        <span class="upload-icon">⬆️</span>
                        <span>Upload</span>
                    </div>
                    <input type="file" id="fileInput" name="images[]" multiple accept="image/*" style="display: none;">
                </div>
                <p class="help-text">Upload up to 4 images. First image will be the cover.</p>
            </div>

            <!-- Product Name -->
            <div class="form-group">
                <label for="name">Product Name</label>
                <input type="text" id="name" name="name" placeholder="e.g. Sony WH-1000XM4 Headphones" required>
            </div>

            <!-- Category -->
            <div class="form-group">
                <label for="category">Category</label>
                <select id="category" name="category" required>
                    <option value="">Select a category</option>
                    <?php
                    $categories = simplexml_load_file('data/categories.xml');
                    foreach ($categories->category as $category) {
                        echo '<option value="' . $category->slug . '">' . $category->name . '</option>';
                    }
                    ?>
                </select>
            </div>

            <!-- Price -->
            <div class="form-group">
                <label for="price">Price</label>
                <div class="input-group">
                    <span class="input-prefix">$</span>
                    <input type="number" id="price" name="price" placeholder="0.00" step="0.01" min="0" required>
                </div>
            </div>

            <!-- Description -->
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="6" placeholder="Describe your product, its condition, and any other relevant details..." required></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Publish Listing</button>
                <a href="dashboard.php" class="btn btn-secondary">Cancel</a>
            </div>
        </form>
    </div>

    <?php include 'includes/footer.php'; ?>
</body>
</html>
