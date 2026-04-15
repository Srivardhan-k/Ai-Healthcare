import { useState } from "react";
import { useParams, Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MessageCircle, MapPin, Clock, Eye, ChevronLeft } from "lucide-react";

const productData = {
  id: "1",
  name: "Sony WH-1000XM4 Wireless Headphones",
  price: 45,
  category: "Electronics",
  condition: "Like New",
  description: "Barely used Sony WH-1000XM4 headphones in excellent condition. Comes with original box, charging cable, and carrying case. Industry-leading noise cancellation and premium sound quality. Perfect for studying or commuting.",
  images: [
    "https://images.unsplash.com/photo-1762028892204-2ef68f7fcfd5?w=800",
    "https://images.unsplash.com/photo-1761005653885-b3d8b04f47c5?w=800",
    "https://images.unsplash.com/photo-1770292170233-5d9e235ec739?w=800",
  ],
  seller: {
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    rating: 4.8,
    location: "University Campus",
    memberSince: "2024",
  },
  views: 234,
  postedDate: "2 days ago",
};

export function ProductDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
              <img
                src={productData.images[selectedImage]}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    selectedImage === index ? "ring-2 ring-[#4F46E5]" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {productData.category}
              </p>
              <h1 className="text-4xl font-bold mb-4">{productData.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {productData.postedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {productData.views} views
                </span>
              </div>
              <p className="text-5xl font-bold text-[#4F46E5] mb-6">${productData.price}</p>

              <div className="space-y-4 mb-8">
                <div>
                  <span className="text-muted-foreground">Condition:</span>{" "}
                  <span className="font-semibold">{productData.condition}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {productData.description}
                  </p>
                </div>
              </div>

              <button className="w-full py-4 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>
            </div>

            {/* Seller Info */}
            <div className="p-6 bg-muted rounded-2xl">
              <h3 className="font-semibold mb-4">Seller Information</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={productData.seller.avatar}
                  alt={productData.seller.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{productData.seller.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {productData.seller.memberSince}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm">⭐ {productData.seller.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {productData.seller.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
