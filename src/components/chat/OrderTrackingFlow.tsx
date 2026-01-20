import React, { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

interface OrderTrackingFlowProps {
  onBack: () => void;
}

const TRACKING_PLATFORMS = [
  {
    id: 'ubereats',
    name: 'Uber Eats',
    color: 'bg-[#06C167]',
    trackingUrl: 'https://www.ubereats.com/orders',
    instructions: 'Allez dans "Commandes" puis cherchez votre commande par numéro.',
  },
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    color: 'bg-[#00CCBC]',
    trackingUrl: 'https://deliveroo.be/fr/orders',
    instructions: 'Ouvrez l\'onglet "Commandes" et cherchez votre numéro de commande.',
  },
  {
    id: 'takeaway',
    name: 'Takeaway.com',
    color: 'bg-[#FF8000]',
    trackingUrl: 'https://www.takeaway.com/orders',
    instructions: 'Accédez à "Mes commandes" et utilisez le numéro de commande.',
  },
  {
    id: 'website',
    name: 'Site Tasty Food',
    color: 'bg-black',
    trackingUrl: 'https://www.tastyfoodangleur.be',
    instructions: 'Contactez-nous directement avec votre numéro de commande.',
  },
];

export const OrderTrackingFlow: React.FC<OrderTrackingFlowProps> = ({ onBack }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setOrderNumber('');
  };

  const handleTrackOrder = () => {
    const platform = TRACKING_PLATFORMS.find((p) => p.id === selectedPlatform);
    if (platform) {
      window.open(platform.trackingUrl, '_blank');
    }
  };

  if (!selectedPlatform) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>Sur quelle plateforme avez-vous commandé ?</span>
        </div>

        <div className="grid gap-2">
          {TRACKING_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform.id)}
              className={`${platform.color} text-white p-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-left flex items-center justify-between`}
            >
              <span>{platform.name}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          ← Retour au menu d'aide
        </button>
      </div>
    );
  }

  const platform = TRACKING_PLATFORMS.find((p) => p.id === selectedPlatform)!;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
        <p className="text-sm text-blue-800">
          <strong>📦 Suivi de commande - {platform.name}</strong><br />
          {platform.instructions}
        </p>
      </div>

      <div>
        <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de commande (optionnel)
        </label>
        <input
          type="text"
          id="orderNumber"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Ex: 12345-ABC"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Vous pourrez coller ce numéro sur la page de suivi.
        </p>
      </div>

      <button
        onClick={handleTrackOrder}
        className={`w-full ${platform.color} text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2`}
      >
        <ExternalLink className="w-5 h-5" />
        Ouvrir le suivi {platform.name}
      </button>

      <button
        onClick={() => setSelectedPlatform(null)}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        ← Changer de plateforme
      </button>
    </div>
  );
};
