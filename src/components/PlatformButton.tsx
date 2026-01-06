import { ExternalLink } from "lucide-react";

interface PlatformButtonProps {
  platform: "deliveroo" | "ubereats" | "takeaway" | "website" | "info";
  href: string;
  location?: string;
}

const platformConfig = {
  deliveroo: {
    name: "Deliveroo",
    color: "bg-[#00CCBC]",
    icon: "🚴",
  },
  ubereats: {
    name: "Uber Eats",
    color: "bg-[#06C167]",
    icon: "🛵",
  },
  takeaway: {
    name: "Takeaway",
    color: "bg-[#FF8000]",
    icon: "🍔",
  },
  website: {
    name: "Site Officiel",
    color: "bg-primary",
    icon: "🌐",
  },
  info: {
    name: "Informations",
    color: "bg-secondary",
    icon: "ℹ️",
  },
};

const PlatformButton = ({ platform, href, location }: PlatformButtonProps) => {
  const config = platformConfig[platform];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-platform group ${config.color} hover:opacity-90`}
    >
      <span className="text-xl">{config.icon}</span>
      <span className="font-semibold text-foreground">
        {location ? `Commander à ${location}` : config.name}
      </span>
      <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

export default PlatformButton;
