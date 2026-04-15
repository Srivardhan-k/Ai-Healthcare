<?php
session_start();
$search = isset($_GET['q']) ? $_GET['q'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - CampusMarket</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
    <?php include 'includes/navbar.php'; ?>

    <div class="products-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
            <h3>🔍 Filters</h3>

            <div class="filter-group">
                <h4>Category</h4>
                <div class="filter-options">
                    <a href="products.php" class="filter-btn <?php echo $category == '' ? 'active' : ''; ?>">All</a>
                    <?php
                    $categories = simplexml_load_file('data/categories.xml');
                    foreach ($categories->category as $cat) {
                        $active = ($category == $cat->slug) ? 'active' : '';
                        echo '<a href="products.php?category=' . $cat->slug . '" class="filter-btn ' . $active . '">' . $cat->name . '</a>';
                    }
                    ?>
                </div>
            </div>

            <div class="filter-group">
                <h4>Price Range</h4>
                <input type="range" min="0" max="1000" value="1000" class="price-range">
                <div class="price-labels">
                    <span>$0</span>
                    <span id="maxPrice">$1000</span>
                </div>
            </div>

            <button class="btn-text">Clear Filters</button>
        </aside>

        <!-- Products Grid -->
        <main class="products-main">
            <div class="container">
                <div class="products-header">
                    <h1>Browse Products</h1>
                    <p class="product-count">
                        <?php
                        $products = simplexml_load_file('data/products.xml');
                        echo count($products->product) . ' products found';
                        ?>
                    </p>
                </div>

                <div class="products-grid">
                    <?php
                    foreach ($products->product as $product) {
                        // Filter by category
                        if ($category && $product->category != $category) {
                            continue;
                        }

                        // Filter by search
                        if ($search && stripos($product->name, $search) === false) {
                            continue;
                        }

                        include 'includes/product-card.php';
                    }
                    ?>
                </div>
            </div>
        </main>
    </div>

    <?php include 'includes/footer.php'; ?>

    <script>
        const range = document.querySelector('.price-range');
        const maxPrice = document.getElementById('maxPrice');
        range.addEventListener('input', (e) => {
            maxPrice.textContent = '$' + e.target.value;
        });
    </script>
</body>
</html>
