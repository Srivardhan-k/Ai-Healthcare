import { Link } from "react-router";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  category: string;
}

export function ProductCard({ id, image, title, price, category }: ProductCardProps) {
  return (
    <Link to={`/products/${id}`} className="group">
      <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{category}</p>
        <h3 className="mt-1 line-clamp-2">{title}</h3>
        <p className="mt-1 text-[#4F46E5] font-semibold">${price}</p>
      </div>
    </Link>
  );
}
