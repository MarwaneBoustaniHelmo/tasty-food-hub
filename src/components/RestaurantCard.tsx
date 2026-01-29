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
      {/* Image with enhanced mobile height and parallax effect */}
      <div className="relative h-44 md:h-60 overflow-hidden bg-gradient-to-br from-card to-background">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent transition-opacity duration-400 group-hover:opacity-60" />
        {/* Gold glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/0 to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-primary/40 text-primary text-sm font-semibold shadow-lg transition-all duration-400 group-hover:bg-primary/20 group-hover:border-primary/60 group-hover:shadow-xl group-hover:scale-105">
            <MapPin size={14} className="transition-transform duration-400 group-hover:scale-110" />
            {location}
          </span>
        </div>
      </div>

      {/* Content with enhanced spacing */}
      <div className="p-5 md:p-7 space-y-4">
        <h3 className="font-display text-[22px] md:text-[30px] text-gradient-gold transition-all duration-400 group-hover:scale-[1.02] drop-shadow-md leading-tight">{name}</h3>
        <p className="text-muted-foreground/90 text-[15px] md:text-base line-clamp-2 leading-relaxed">{description}</p>

        {/* Full-width Order Buttons with enhanced states */}
        <div className="space-y-2.5 pt-2">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`mobile-platform-btn ${platformColors[link.platform]} shadow-md hover:shadow-xl`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-xl transition-transform duration-300 group-hover:scale-110">{platformIcons[link.platform]}</span>
              <span className="flex-1 text-left text-[15px] md:text-base font-semibold">{link.label}</span>
              <ExternalLink size={18} className="opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
