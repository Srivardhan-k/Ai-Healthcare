import { Link } from "react-router";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { BookOpen, Laptop, Armchair, Headphones, Star } from "lucide-react";

const categories = [
  { icon: BookOpen, name: "Books", count: "250+ items" },
  { icon: Laptop, name: "Electronics", count: "180+ items" },
  { icon: Armchair, name: "Furniture", count: "120+ items" },
  { icon: Headphones, name: "Accessories", count: "300+ items" },
];

const featuredProducts = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1762028892204-2ef68f7fcfd5?w=400",
    title: "Sony Wireless Headphones",
    price: 45,
    category: "Electronics",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1585521551422-497df464aa43?w=400",
    title: "Calculus & Physics Textbooks",
    price: 30,
    category: "Books",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1750306957820-f778b67c4e13?w=400",
    title: "Modern Office Chair",
    price: 80,
    category: "Furniture",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1701576766277-c6160505581d?w=400",
    title: "MacBook Pro 2020",
    price: 650,
    category: "Electronics",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    text: "Found amazing deals on textbooks. Saved over $200 this semester!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    text: "Sold my old laptop in just 2 days. Super easy and safe platform.",
    rating: 5,
  },
  {
    name: "Emily Davis",
    text: "Best place to find affordable furniture for my dorm room.",
    rating: 5,
  },
];

export function Landing() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1701576766277-c6160505581d?w=1200"
            alt="Student studying"
            className="w-full h-full object-cover opacity-10"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your Campus
              <span className="block text-[#4F46E5]">Marketplace</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Buy and sell textbooks, electronics, furniture, and more with fellow students.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="px-8 py-4 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Browse Products
              </Link>
              <Link
                to="/add-product"
                className="px-8 py-4 bg-background border-2 border-[#4F46E5] text-[#4F46E5] rounded-lg hover:bg-[#4F46E5] hover:text-white transition-colors"
              >
                Sell an Item
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold mb-12">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/products?category=${category.name.toLowerCase()}`}
                className="block p-8 bg-muted rounded-2xl hover:bg-accent transition-colors text-center"
              >
                <category.icon className="w-12 h-12 mx-auto mb-4 text-[#4F46E5]" />
                <h3 className="mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-[#4F46E5] hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">What Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-background rounded-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#4F46E5] text-[#4F46E5]" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
