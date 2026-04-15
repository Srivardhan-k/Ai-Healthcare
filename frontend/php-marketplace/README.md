# CampusMarket - Student Marketplace Platform

A complete PHP-based marketplace for students to buy and sell products.

## 📁 Project Structure

```
php-marketplace/
├── index.php                 # Landing page
├── login.php                 # Login page
├── signup.php                # Signup page
├── dashboard.php             # User dashboard
├── products.php              # Product listing page
├── product-detail.php        # Product detail page
├── add-product.php           # Add new product
├── profile.php               # User profile
├── logout.php                # Logout handler
├── includes/
│   ├── navbar.php            # Navigation bar component
│   ├── footer.php            # Footer component
│   └── product-card.php      # Product card component
├── assets/
│   └── css/
│       ├── style.css         # Main stylesheet
│       └── responsive.css    # Responsive styles
├── data/
│   ├── categories.xml        # Categories data
│   ├── products.xml          # Products data
│   └── testimonials.xml      # Testimonials data
├── config/
│   └── database.php          # Database configuration
├── api/
│   ├── auth.php              # Authentication functions
│   └── products.php          # Product CRUD functions
└── README.md
```

## 🚀 Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- XAMPP/WAMP/MAMP (recommended for local development)

### Setup Instructions

1. **Install XAMPP/WAMP**
   - Download from [https://www.apachefriends.org/](https://www.apachefriends.org/)
   - Install and start Apache and MySQL

2. **Copy Files**
   ```bash
   # Copy the php-marketplace folder to your web server directory
   # For XAMPP: C:/xampp/htdocs/
   # For WAMP: C:/wamp64/www/
   ```

3. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create a new database named `campus_market`
   - Run the SQL schema from `config/database.php`

4. **Configure Database**
   - Open `config/database.php`
   - Update database credentials if needed:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_NAME', 'campus_market');
     define('DB_USER', 'root');
     define('DB_PASS', '');
     ```

5. **Access the Website**
   - Open browser: `http://localhost/php-marketplace/`

## 🎨 Features

### Pages
- ✅ **Landing Page** - Hero section, categories, featured products, testimonials
- ✅ **Login/Signup** - User authentication
- ✅ **Dashboard** - User stats, recent products, quick actions
- ✅ **Add Product** - Form to list new products
- ✅ **Product Listing** - Browse with filters (category, price)
- ✅ **Product Detail** - Full product view with seller info
- ✅ **Profile** - User information and their products

### Technologies
- **HTML5** - Structure
- **CSS3** - Styling with custom properties
- **PHP** - Server-side logic
- **XML** - Data storage (can be replaced with MySQL)
- **MySQL** - Database (optional, schema provided)
- **PDO** - Database abstraction layer

### Design
- Modern, clean UI with indigo (#4F46E5) primary color
- Fully responsive (Desktop, Tablet, Mobile)
- Card-based layout
- Smooth transitions and hover effects
- 8px grid system for consistent spacing

## 📦 XML Data Files

The project uses XML files for easy data management:

- `data/categories.xml` - Product categories
- `data/products.xml` - Product listings
- `data/testimonials.xml` - User testimonials

## 🔒 Security Notes

⚠️ **For Production Use:**

1. **Password Security**
   - Current code uses `password_hash()` - ✅ Good
   - Always use HTTPS in production

2. **SQL Injection**
   - Use PDO prepared statements (already implemented)

3. **XSS Protection**
   - Sanitize all user inputs with `htmlspecialchars()`

4. **File Uploads**
   - Validate file types and sizes
   - Store uploads outside web root

5. **Session Security**
   - Use `session_regenerate_id()` after login
   - Set secure session cookies

## 🔄 Converting XML to MySQL

To use MySQL instead of XML files:

1. Run the database schema in `config/database.php`
2. Replace XML loading code with database queries
3. Use functions from `api/auth.php` and `api/products.php`

Example:
```php
// Instead of:
$products = simplexml_load_file('data/products.xml');

// Use:
include 'config/database.php';
include 'api/products.php';
$products = getProducts();
```

## 📱 Responsive Breakpoints

- **Desktop**: 1440px and above
- **Tablet**: 768px - 1439px
- **Mobile**: 320px - 767px

## 🎨 Color Scheme

```css
--primary: #4F46E5 (Indigo)
--primary-dark: #4338CA
--background: #ffffff
--muted: #ececf0
--foreground: #030213
```

## 📄 License

This project is provided as-is for educational purposes.

## 🆘 Support

For issues or questions, check:
- PHP error logs: `xampp/apache/logs/error.log`
- Browser console for JavaScript errors
- Database connection in `config/database.php`

## 🚀 Next Steps

1. Implement user authentication with sessions
2. Add image upload functionality
3. Integrate payment gateway
4. Add messaging system between buyers and sellers
5. Implement search functionality
6. Add email notifications
7. Create admin panel
