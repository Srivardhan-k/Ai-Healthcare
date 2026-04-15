<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusMarket - Student Marketplace</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-overlay"></div>
        <div class="container">
            <div class="hero-content">
                <h1>Your Campus<br><span class="highlight">Marketplace</span></h1>
                <p class="hero-subtitle">Buy and sell textbooks, electronics, furniture, and more with fellow students.</p>
                <div class="hero-buttons">
                    <a href="products.php" class="btn btn-primary">Browse Products</a>
                    <a href="add-product.php" class="btn btn-secondary">Sell an Item</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
        <div class="container">
            <h2 class="section-title">Browse by Category</h2>
            <div class="categories-grid">
                <?php
                $xml = simplexml_load_file('data/categories.xml');
                foreach ($xml->category as $category) {
                    echo '<a href="products.php?category=' . $category->slug . '" class="category-card">';
                    echo '<div class="category-icon">' . $category->icon . '</div>';
                    echo '<h3>' . $category->name . '</h3>';
                    echo '<p>' . $category->count . ' items</p>';
                    echo '</a>';
                }
                ?>
            </div>
        </div>
    </section>

    <!-- Featured Products Section -->
    <section class="products-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Featured Products</h2>
                <a href="products.php" class="view-all">View all →</a>
            </div>
            <div class="products-grid">
                <?php
                $products = simplexml_load_file('data/products.xml');
                $count = 0;
                foreach ($products->product as $product) {
                    if ($product->featured == 'true' && $count < 4) {
                        include 'includes/product-card.php';
                        $count++;
                    }
                }
                ?>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
        <div class="container">
            <h2 class="section-title">What Students Say</h2>
            <div class="testimonials-grid">
                <?php
                $testimonials = simplexml_load_file('data/testimonials.xml');
                foreach ($testimonials->testimonial as $testimonial) {
                    echo '<div class="testimonial-card">';
                    echo '<div class="rating">';
                    for ($i = 0; $i < (int)$testimonial->rating; $i++) {
                        echo '★';
                    }
                    echo '</div>';
                    echo '<p class="testimonial-text">"' . $testimonial->text . '"</p>';
                    echo '<p class="testimonial-author">' . $testimonial->name . '</p>';
                    echo '</div>';
                }
                ?>
            </div>
        </div>
    </section>

    <?php include 'includes/footer.php'; ?>
</body>
</html>
