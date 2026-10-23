import Image from "next/image";
import Watch from "./Watch";
import { getCategory } from "@/lib/config";

// Shows a product's photo, or a drawn watch in its category colours when it has none yet.
export default function ProductVisual({ product, index = 0, sizes = "(max-width: 768px) 50vw, 25vw", priority, animated = true, watchWidth = "60%" }) {
  const image = product?.images?.[index];
  if (image) {
    return (
      <Image
        src={image.url}
        alt={`${product.name}${index ? ` view ${index + 1}` : ""}`}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return (
    <div className="visual-fallback" style={{ width: watchWidth }}>
      <Watch look={getCategory(product?.category)?.look} animated={animated} label={product?.name} />
    </div>
  );
}
