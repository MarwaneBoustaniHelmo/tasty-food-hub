import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: "default" | "card" | "accent";
  id?: string;
}

/**
 * Reusable Section component for consistent spacing and layout
 * Mobile-first: py-10 on mobile, py-20 on desktop
 */
const Section = ({ 
  children, 
  className, 
  title, 
  subtitle, 
  variant = "default",
  id 
}: SectionProps) => {
  const variants = {
    default: "",
    card: "bg-card",
    accent: "bg-gradient-to-br from-primary/5 to-accent/5",
  };

  return (
    <section 
      id={id}
      className={cn(
        "py-10 md:py-20",
        variants[variant],
        className
      )}
    >
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="text-center mb-6 md:mb-12">
            {title && (
              <h2 className="section-title mb-2 md:mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
