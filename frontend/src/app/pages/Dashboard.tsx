import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Package,
  Eye,
  DollarSign,
  Plus,
  LayoutDashboard,
  User,
  Settings,
  LogOut
} from "lucide-react";

const stats = [
  { label: "Total Products", value: "12", icon: Package, color: "text-blue-600" },
  { label: "Total Views", value: "1,234", icon: Eye, color: "text-green-600" },
  { label: "Total Sales", value: "$850", icon: DollarSign, color: "text-purple-600" },
];

const recentProducts = [
  {
    id: "1",
    name: "Sony Headphones",
    image: "https://images.unsplash.com/photo-1762028892204-2ef68f7fcfd5?w=100",
    price: 45,
    views: 23,
    status: "Active",
  },
  {
    id: "2",
    name: "Calculus Textbook",
    image: "https://images.unsplash.com/photo-1585521551422-497df464aa43?w=100",
    price: 30,
    views: 15,
    status: "Active",
  },
  {
    id: "3",
    name: "Office Chair",
    image: "https://images.unsplash.com/photo-1750306957820-f778b67c4e13?w=100",
    price: 80,
    views: 42,
    status: "Sold",
  },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Plus, label: "Add Product", href: "/add-product" },
  { icon: Package, label: "My Products", href: "/products" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "#" },
];

export function Dashboard() {
  return (
    <div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 hidden lg:block">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-[#4F46E5] text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-muted transition-colors w-full">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your products and sales</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 bg-muted rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Products */}
            <div className="bg-background border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold">Recent Products</h2>
              </div>
              <div className="divide-y divide-border">
                {recentProducts.map((product) => (
                  <div key={product.id} className="p-6 flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.views} views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#4F46E5] mb-1">${product.price}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          product.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/add-product"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </Link>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
