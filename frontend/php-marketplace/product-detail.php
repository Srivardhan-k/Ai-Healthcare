<?php
session_start();
$productId = isset($_GET['id']) ? $_GET['id'] : 1;
$products = simplexml_load_file('data/products.xml');
$currentProduct = null;

foreach ($products->product as $product) {
    if ($product->id == $productId) {
        $currentProduct = $product;
        break;
    }
}

if (!$currentProduct) {
    header('Location: products.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $currentProduct->name; ?> - CampusMarket</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <div class="container product-detail-container">
        <a href="products.php" class="back-link">← Back to Products</a>

        <div class="product-detail-grid">
            <!-- Product Images -->
            <div class="product-images">
                <div class="main-image">
                    <img src="<?php echo $currentProduct->image; ?>" alt="<?php echo $currentProduct->name; ?>" id="mainImage">
                </div>
                <div class="image-thumbnails">
                    <img src="<?php echo $currentProduct->image; ?>" alt="Thumbnail" class="thumbnail active" onclick="changeImage(this)">
                    <img src="<?php echo $currentProduct->image; ?>" alt="Thumbnail" class="thumbnail" onclick="changeImage(this)">
                    <img src="<?php echo $currentProduct->image; ?>" alt="Thumbnail" class="thumbnail" onclick="changeImage(this)">
                </div>
            </div>

            <!-- Product Info -->
            <div class="product-info-detail">
                <p class="product-category-tag"><?php echo $currentProduct->category; ?></p>
                <h1 class="product-title"><?php echo $currentProduct->name; ?></h1>

                <div class="product-meta">
                    <span>🕐 2 days ago</span>
                    <span>👁️ 234 views</span>
                </div>

                <p class="product-price-large">$<?php echo $currentProduct->price; ?></p>

                <div class="product-details">
                    <div class="detail-item">
                        <span class="detail-label">Condition:</span>
                        <span class="detail-value">Like New</span>
                    </div>
                    <div class="description-section">
                        <h3>Description</h3>
                        <p><?php echo $currentProduct->description; ?></p>
                    </div>
                </div>

                <button class="btn btn-primary btn-full">💬 Contact Seller</button>

                <!-- Seller Info -->
                <div class="seller-card">
                    <h3>Seller Information</h3>
                    <div class="seller-profile">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Seller" class="seller-avatar">
                        <div class="seller-details">
                            <p class="seller-name">Sarah Johnson</p>
                            <p class="seller-since">Member since 2024</p>
                            <p class="seller-rating">⭐ 4.8</p>
                        </div>
                    </div>
                    <p class="seller-location">📍 University Campus</p>
                </div>
            </div>
        </div>
    </div>

    <?php include 'includes/footer.php'; ?>

    <script>
        function changeImage(thumb) {
            document.getElementById('mainImage').src = thumb.src;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        }
    </script>
</body>
</html>
