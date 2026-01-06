import { MapPin, Instagram, Facebook, Clock, ExternalLink } from "lucide-react";

const Contact = () => {
  const locations = [
    {
      name: "Tasty Food Angleur",
      address: "Angleur, Liège",
    },
    {
      name: "Tasty Food Wandre",
      address: "Wandre, Liège",
    },
    {
      name: "Tasty Food Seraing",
      address: "Seraing, Liège",
    },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com",
    },
  ];

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title mb-4">
            <span className="text-gradient-gold">CONTACTEZ</span>-NOUS
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Retrouvez toutes les informations sur nos restaurants Tasty Food 
            dans la région liégeoise.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Locations */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-primary">NOS ADRESSES</h2>
            
            <div className="space-y-4">
              {locations.map((location) => (
                <div
                  key={location.name}
                  className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <MapPin className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-foreground">
                        {location.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {location.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-primary" size={20} />
                <h3 className="font-display text-xl text-foreground">HORAIRES</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Consultez les horaires sur les plateformes de commande de chaque restaurant.
              </p>
            </div>
          </div>

          {/* Social & Info */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-primary">SUIVEZ-NOUS</h2>

            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:translate-y-[-2px]"
                >
                  <social.icon className="text-primary" size={24} />
                  <span className="font-medium">{social.name}</span>
                  <ExternalLink size={16} className="text-muted-foreground" />
                </a>
              ))}
            </div>

            {/* Order Reminder */}
            <div className="p-6 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="font-display text-xl text-accent mb-3">
                📍 POUR COMMANDER
              </h3>
              <p className="text-muted-foreground mb-4">
                Les commandes se font exclusivement via nos plateformes partenaires :
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium">
                  Takeaway
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium">
                  Uber Eats
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium">
                  Deliveroo
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium">
                  Sites officiels
                </span>
              </div>
            </div>

            {/* Contact Note */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display text-xl text-foreground mb-3">
                BESOIN D'AIDE ?
              </h3>
              <p className="text-muted-foreground text-sm">
                Pour toute question concernant une commande, veuillez contacter 
                directement la plateforme utilisée (Takeaway, Uber Eats, Deliveroo) 
                ou le restaurant concerné.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
