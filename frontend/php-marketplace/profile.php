<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - CampusMarket</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <div class="container profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" alt="Profile" class="profile-avatar">

            <div class="profile-info">
                <div class="profile-top">
                    <div>
                        <h1>Sarah Johnson</h1>
                        <div class="profile-meta">
                            <span>✉️ sarah.j@university.edu</span>
                            <span>📍 University Campus</span>
                            <span>📅 Member since January 2024</span>
                        </div>
                    </div>
                    <button class="btn btn-primary">✏️ Edit Profile</button>
                </div>

                <p class="profile-bio">Marketing major, selling used textbooks and electronics. All items in great condition!</p>

                <!-- Stats -->
                <div class="profile-stats">
                    <div class="stat">
                        <p class="stat-number">12</p>
                        <p class="stat-label">Products</p>
                    </div>
                    <div class="stat">
                        <p class="stat-number">8</p>
                        <p class="stat-label">Sales</p>
                    </div>
                    <div class="stat">
                        <p class="stat-number">4.8</p>
                        <p class="stat-label">Rating</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Products -->
        <div class="profile-products">
            <h2>My Products</h2>
            <div class="products-grid">
                <?php
                $products = simplexml_load_file('data/products.xml');
                $count = 0;
                foreach ($products->product as $product) {
                    if ($count < 4) {
                        include 'includes/product-card.php';
                        $count++;
                    }
                }
                ?>
            </div>
        </div>
    </div>

    <?php include 'includes/footer.php'; ?>
</body>
</html>
