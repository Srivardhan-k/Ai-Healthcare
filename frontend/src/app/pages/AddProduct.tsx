import { useState } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Upload, X } from "lucide-react";

const categories = ["Electronics", "Books", "Furniture", "Accessories", "Clothing", "Other"];

export function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const handleImageUpload = () => {
    setImages([
      ...images,
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    ]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
          <p className="text-muted-foreground">List your item for sale</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images */}
          <div>
            <label className="block mb-4">Product Images</label>
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-[#4F46E5] transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload</span>
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upload up to 4 images. First image will be the cover.
            </p>
          </div>

          {/* Product Name */}
          <div>
            <label className="block mb-2">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
              placeholder="e.g. Sony WH-1000XM4 Headphones"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2">Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full pl-8 pr-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors resize-none"
              placeholder="Describe your product, its condition, and any other relevant details..."
              rows={6}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Publish Listing
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
