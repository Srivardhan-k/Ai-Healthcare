import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { Filter, SlidersHorizontal } from "lucide-react";

const categories = ["All", "Electronics", "Books", "Furniture", "Accessories", "Clothing"];

const allProducts = [
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
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    title: "Computer Science Textbooks",
    price: 25,
    category: "Books",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1770292170233-5d9e235ec739?w=400",
    title: "Apple AirPods Pro",
    price: 120,
    category: "Electronics",
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1762423992203-552b7c671b92?w=400",
    title: "Ergonomic Desk Chair",
    price: 95,
    category: "Furniture",
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1664095885286-65fb80ba335d?w=400",
    title: "Engineering Textbook Set",
    price: 40,
    category: "Books",
  },
];

export function ProductListing() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = allProducts.filter((product) => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  return (
    <div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
            <p className="text-muted-foreground">{filteredProducts.length} products found</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-accent transition-colors lg:hidden"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-64 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block mb-3 text-sm">Category</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-[#4F46E5] text-white"
                            : "bg-muted hover:bg-accent"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block mb-3 text-sm">Price Range</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-[#4F46E5]"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$0</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 1000]);
                  }}
                  className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
