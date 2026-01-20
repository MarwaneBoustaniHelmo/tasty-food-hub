import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface PlatformPrice {
  platform: 'ubereats' | 'deliveroo' | 'takeaway';
  price: number;
  currency: string;
  available: boolean;
}

interface PriceComparisonData {
  status: string;
  restaurant: string;
  timestamp: string;
  data: {
    uberEats: any;
    deliveroo: any;
    takeaway: any;
  };
  errors: {
    uberEats: string | null;
    deliveroo: string | null;
    takeaway: string | null;
  };
}

const platformConfig = {
  ubereats: {
    name: 'Uber Eats',
    color: 'bg-[#06C167]',
    textColor: 'text-white',
    icon: '🛵',
    url: 'https://www.ubereats.com',
  },
  deliveroo: {
    name: 'Deliveroo',
    color: 'bg-[#00CCBC]',
    textColor: 'text-white',
    icon: '🚴',
    url: 'https://www.deliveroo.be',
  },
  takeaway: {
    name: 'Takeaway',
    color: 'bg-[#FF8000]',
    textColor: 'text-white',
    icon: '🍔',
    url: 'https://www.takeaway.com',
  },
};

export function PriceComparison({ restaurantName = 'Tasty Food' }: { restaurantName?: string }) {
  const [data, setData] = useState<PriceComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get API URL from environment or default to localhost
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Use YOUR backend (not direct API calls)
      const response = await fetch(
        `${apiUrl}/api/price-comparison?restaurant_name=${encodeURIComponent(restaurantName)}`,
        {
          signal: AbortSignal.timeout(8000), // 8 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('[PriceComparison] Error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les prix. Veuillez réessayer.'
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [restaurantName]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des prix...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Erreur de chargement
          </CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrices}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Disponibilité sur les plateformes</CardTitle>
            <CardDescription>
              {restaurantName} - {data?.timestamp && new Date(data.timestamp).toLocaleString('fr-BE')}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPrices}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Uber Eats */}
          <PlatformCard
            platform="ubereats"
            available={!!data?.data.uberEats}
            error={data?.errors.uberEats}
          />

          {/* Deliveroo */}
          <PlatformCard
            platform="deliveroo"
            available={!!data?.data.deliveroo}
            error={data?.errors.deliveroo}
          />

          {/* Takeaway */}
          <PlatformCard
            platform="takeaway"
            available={!!data?.data.takeaway}
            error={data?.errors.takeaway}
          />
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Astuce :</strong> Comparez les frais de livraison et les temps d'attente sur chaque plateforme
            avant de commander.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformCard({
  platform,
  available,
  error,
}: {
  platform: keyof typeof platformConfig;
  available: boolean;
  error: string | null;
}) {
  const config = platformConfig[platform];

  return (
    <div
      className={`p-4 rounded-lg border ${
        available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`${config.color} ${config.textColor} w-10 h-10 rounded-full flex items-center justify-center text-xl`}
          >
            {config.icon}
          </div>
          <div>
            <p className="font-semibold">{config.name}</p>
            {available ? (
              <Badge variant="default" className="bg-green-600">
                ✓ Disponible
              </Badge>
            ) : (
              <Badge variant="secondary">
                {error ? '⚠ Erreur' : '✗ Non disponible'}
              </Badge>
            )}
          </div>
        </div>

        {available && (
          <a
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Commander
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-muted-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
