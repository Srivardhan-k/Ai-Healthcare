import { Link, useNavigate } from "react-router";
import { Search, User, ShoppingBag } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-[#4F46E5]" />
            <span className="font-semibold text-xl">CampusMarket</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-foreground hover:text-[#4F46E5] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/profile"
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
