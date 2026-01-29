import { useEffect, useState } from "react";
import { ExternalLink, Play, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NearestRestaurantBanner from "@/components/NearestRestaurantBanner";

const Videos = () => {
  const tiktokProfile = "https://www.tiktok.com/@tastyfoodliege";
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Load TikTok embed script
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    
    script.onload = () => {
      console.log('TikTok embed script loaded successfully');
      // Give time for TikTok to render
      setTimeout(() => setIsLoading(false), 2000);
    };
    
    script.onerror = () => {
      console.error('Failed to load TikTok embed script');
      setHasError(true);
      setIsLoading(false);
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  return (
    <main className="pb-10 md:pb-20 min-h-screen">
      <div className="container px-4">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00F2EA]/10 border border-[#00F2EA]/30 mb-4 md:mb-6">
            <span className="text-[#00F2EA] text-sm font-medium">@tastyfoodliege</span>
          </div>
          
          <h1 className="section-title mb-3 md:mb-4">
            NOS <span className="text-gradient-gold">VIDÉOS</span> TIKTOK
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto mb-6 md:mb-8">
            Suivez nos aventures, découvrez nos nouveaux burgers et vivez l'expérience Tasty Food au quotidien !
          </p>
          
          {/* Main CTA */}
          <a
            href={tiktokProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-order inline-flex items-center gap-3 text-base md:text-lg px-6 md:px-8 py-4"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            Suivre sur TikTok
            <ExternalLink size={18} />
          </a>
        </div>

        {/* TikTok Embed Section */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="rounded-2xl bg-card border border-border p-6 md:p-8">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement des vidéos TikTok...</p>
              </div>
            )}

            {/* Error State */}
            {hasError && (
              <Alert className="border-amber-500/20 bg-amber-500/5">
                <AlertDescription className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Impossible de charger le contenu TikTok. Visitez notre profil directement :
                  </p>
                  <a
                    href={tiktokProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    Voir sur TikTok
                    <ExternalLink size={16} />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            {/* TikTok Embed */}
            <div className={isLoading || hasError ? 'hidden' : 'block'}>
              <blockquote 
                className="tiktok-embed" 
                cite={tiktokProfile}
                data-unique-id="tastyfoodliege" 
                data-embed-type="creator"
                style={{ maxWidth: "780px", minWidth: "288px", margin: "0 auto" }}
              >
                <section>
                  <a 
                    target="_blank" 
                    rel="noopener noreferrer"
                    href={`${tiktokProfile}?refer=embed`}
                  >
                    @tastyfoodliege
                  </a>
                </section>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Geolocation CTA - Same as Order page */}
        <div className="mt-12 md:mt-16">
          <NearestRestaurantBanner />
        </div>
      </div>
    </main>
  );
};

export default Videos;
