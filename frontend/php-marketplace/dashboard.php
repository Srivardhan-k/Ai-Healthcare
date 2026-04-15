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
    <title>Dashboard - CampusMarket</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <nav class="sidebar-nav">
                <a href="dashboard.php" class="sidebar-link active">
                    <span class="icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="add-product.php" class="sidebar-link">
                    <span class="icon">➕</span>
                    <span>Add Product</span>
                </a>
                <a href="products.php" class="sidebar-link">
                    <span class="icon">📦</span>
                    <span>My Products</span>
                </a>
                <a href="profile.php" class="sidebar-link">
                    <span class="icon">👤</span>
                    <span>Profile</span>
                </a>
                <a href="#" class="sidebar-link">
                    <span class="icon">⚙️</span>
                    <span>Settings</span>
                </a>
                <a href="logout.php" class="sidebar-link logout">
                    <span class="icon">🚪</span>
                    <span>Logout</span>
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="dashboard-main">
            <div class="container">
                <div class="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Manage your products and sales</p>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue">📦</div>
                        <div class="stat-content">
                            <p class="stat-value">12</p>
                            <p class="stat-label">Total Products</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">👁️</div>
                        <div class="stat-content">
                            <p class="stat-value">1,234</p>
                            <p class="stat-label">Total Views</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">💰</div>
                        <div class="stat-content">
                            <p class="stat-value">$850</p>
                            <p class="stat-label">Total Sales</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Products -->
                <div class="recent-products">
                    <h2>Recent Products</h2>
                    <div class="table-container">
                        <table class="products-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Views</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $products = simplexml_load_file('data/products.xml');
                                $count = 0;
                                foreach ($products->product as $product) {
                                    if ($count < 3) {
                                        echo '<tr>';
                                        echo '<td class="product-cell">';
                                        echo '<img src="' . $product->image . '" alt="' . $product->name . '" class="product-thumb">';
                                        echo '<span>' . $product->name . '</span>';
                                        echo '</td>';
                                        echo '<td class="price">$' . $product->price . '</td>';
                                        echo '<td>' . rand(10, 50) . ' views</td>';
                                        echo '<td><span class="badge badge-active">Active</span></td>';
                                        echo '</tr>';
                                        $count++;
                                    }
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <a href="add-product.php" class="btn btn-primary">
                    ➕ Add New Product
                </a>
            </div>
        </main>
    </div>

    <?php include 'includes/footer.php'; ?>
</body>
</html>
