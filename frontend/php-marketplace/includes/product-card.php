<a href="product-detail.php?id=<?php echo $product->id; ?>" class="product-card">
    <div class="product-image">
        <img src="<?php echo $product->image; ?>" alt="<?php echo $product->name; ?>">
    </div>
    <div class="product-info">
        <p class="product-category"><?php echo $product->category; ?></p>
        <h3 class="product-name"><?php echo $product->name; ?></h3>
        <p class="product-price">$<?php echo $product->price; ?></p>
    </div>
</a>
