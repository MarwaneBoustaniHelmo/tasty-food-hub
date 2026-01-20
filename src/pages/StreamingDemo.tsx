import { StreamingChat, StreamingStats } from '@/components/StreamingChat';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StreamingDemo() {
  const { streamSpeed, messages } = useStreamingChat();

  const totalTokens = messages.reduce((sum, msg) => {
    return sum + (msg.metadata?.tokenCount || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold to-gold-light py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link 
            to="/" 
            className="text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bebas text-white">
              Streaming Response Demo
            </h1>
            <p className="text-sm text-white/80">
              Réponses en temps réel • 8x plus rapide
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 h-[calc(100vh-180px)]">
          <StreamingChat
            placeholder="Posez une question sur Tasty Food..."
            systemPrompt="You are Tasty Food support assistant. Be helpful and concise. Language: French."
          />
        </div>

        {/* Stats & Info */}
        <div className="space-y-6">
          {/* Performance Stats */}
          {streamSpeed > 0 && (
            <StreamingStats 
              streamSpeed={streamSpeed} 
              totalTokens={totalTokens}
            />
          )}

          {/* Feature Highlights */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="font-bebas text-xl text-gray-900 mb-4">
              ⚡ Pourquoi le streaming ?
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>8x plus rapide</strong> ressenti utilisateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Feedback immédiat</strong> en ~300ms au lieu de 2.5s</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Perception améliorée</strong> de la vitesse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Engagement accru</strong> - l'utilisateur voit la réponse se construire</span>
              </li>
            </ul>
          </div>

          {/* Technical Details */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg text-white">
            <h3 className="font-bebas text-xl mb-4">
              🔧 Détails techniques
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Claude 3.5 Sonnet streaming API</li>
              <li>• Token-by-token processing</li>
              <li>• Anthropic SDK avec streaming natif</li>
              <li>• Buffer 512 bytes, timeout 60s</li>
              <li>• Vitesse moyenne: 15-25 tokens/s</li>
            </ul>
          </div>

          {/* Comparison */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-bebas text-xl text-blue-900 mb-4">
              📊 Avant / Après
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-red-700">❌ Sans streaming</p>
                <p className="text-gray-700">Attente complète: <strong>2.5s</strong></p>
                <p className="text-gray-600 text-xs">Toute la réponse d'un coup</p>
              </div>
              <div className="border-t border-blue-200 pt-4">
                <p className="font-semibold text-green-700">✅ Avec streaming</p>
                <p className="text-gray-700">Premier token: <strong>~300ms</strong></p>
                <p className="text-gray-600 text-xs">Réponse progressive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
