import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StreamingDemo() {
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
              Streaming Demo
            </h1>
            <p className="text-sm text-white/80">
              Feature coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bebas text-gray-900 mb-4">
            Chatbot en reconstruction
          </h2>
          <p className="text-gray-600">
            Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
