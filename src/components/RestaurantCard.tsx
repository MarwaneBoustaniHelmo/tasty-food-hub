import { MapPin, Clock } from "lucide-react";
import PlatformButton from "./PlatformButton";

interface RestaurantCardProps {
  name: string;
  location: string;
  description: string;
  image: string;
  links: {
    platform: "deliveroo" | "ubereats" | "takeaway" | "website" | "info";
    href: string;
    label: string;
  }[];
}

const RestaurantCard = ({ name, location, description, image, links }: RestaurantCardProps) => {
  return (
    <div className="card-restaurant group">
      {/* Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
            <MapPin size={14} />
            {location}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 className="font-display text-2xl md:text-3xl text-gradient-gold">{name}</h3>
        <p className="text-muted-foreground">{description}</p>

        {/* Order Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-platform justify-start"
            >
              <span className="text-lg">
                {link.platform === "deliveroo" && "🚴"}
                {link.platform === "ubereats" && "🛵"}
                {link.platform === "takeaway" && "🍔"}
                {link.platform === "website" && "🌐"}
                {link.platform === "info" && "ℹ️"}
              </span>
              <span className="flex-1 text-left">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
