import { MapPin, ExternalLink } from "lucide-react";

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

const platformColors: Record<string, string> = {
  deliveroo: "bg-[#00CCBC]",
  ubereats: "bg-[#06C167]",
  takeaway: "bg-[#FF8000]",
  website: "bg-primary",
  info: "bg-secondary",
};

const platformIcons: Record<string, string> = {
  deliveroo: "🚴",
  ubereats: "🛵",
  takeaway: "🍔",
  website: "🌐",
  info: "ℹ️",
};

const RestaurantCard = ({ name, location, description, image, links }: RestaurantCardProps) => {
  return (
    <div className="card-restaurant group">
      {/* Image - Smaller on mobile */}
      <div className="relative h-36 md:h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs md:text-sm font-medium">
            <MapPin size={12} />
            {location}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        <h3 className="font-display text-xl md:text-3xl text-gradient-gold">{name}</h3>
        <p className="text-muted-foreground text-sm md:text-base line-clamp-2">{description}</p>

        {/* Full-width Order Buttons on mobile */}
        <div className="space-y-2 pt-1">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`mobile-platform-btn ${platformColors[link.platform]}`}
            >
              <span className="text-lg">{platformIcons[link.platform]}</span>
              <span className="flex-1 text-left text-sm md:text-base font-medium">{link.label}</span>
              <ExternalLink size={16} className="opacity-70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
