import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { Mail, MapPin, Calendar, Edit } from "lucide-react";

const userData = {
  name: "Sarah Johnson",
  email: "sarah.j@university.edu",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  location: "University Campus",
  memberSince: "January 2024",
  bio: "Marketing major, selling used textbooks and electronics. All items in great condition!",
  stats: {
    products: 12,
    sales: 8,
    rating: 4.8,
  },
};

const userProducts = [
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

export function Profile() {
  return (
    <div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-muted rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {userData.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userData.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since {userData.memberSince}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
              <p className="text-muted-foreground mb-6">{userData.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold">{userData.stats.products}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userData.stats.sales}</p>
                  <p className="text-sm text-muted-foreground">Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userData.stats.rating}</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {userProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
