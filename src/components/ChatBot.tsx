import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, MapPin, ExternalLink, RefreshCcw, ShoppingBag } from 'lucide-react';

// --- TYPE DÉFINITIONS ---
type PlatformLink = {
  name: string;
  url: string;
  color: string; // Pour le style du bouton
};

type LocationData = {
  name: string;
  platforms: PlatformLink[];
};

// --- CONFIGURATION DES DONNÉES (Le "Cerveau" du bot) ---
const LOCATIONS: Record<string, LocationData> = {
  angleur: { 
    name: "Angleur", 
    platforms: [
      { name: "Site Officiel (Click & Collect)", url: "https://www.tastyfoodangleur.be", color: "bg-black" },
      { name: "Deliveroo", url: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" }, // Couleur Deliveroo
      { name: "Uber Eats", url: "https://www.ubereats.com/be/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" } // Couleur Uber
    ]
  },
  wandre: { 
    name: "Wandre", 
    platforms: [
      { name: "Uber Eats", url: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
      { name: "Takeaway.com", url: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" } // Couleur Takeaway
    ]
  },
  seraing: { 
    name: "Seraing", 
    platforms: [
      { name: "Deliveroo", url: "https://deliveroo.be/fr/menu/liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      { name: "Uber Eats", url: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
      { name: "Takeaway.com", url: "https://www.takeaway.com/be-fr/menu/tasty-food-seraing", color: "bg-[#FF8000]" }
    ]
  },
  saintgilles: { 
    name: "Saint-Gilles", 
    platforms: [
      { name: "Uber Eats", url: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", url: "https://deliveroo.be/fr/menu/liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" }
    ]
  }
};

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  showPlatforms?: PlatformLink[]; // Liste des boutons à afficher
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<'init' | 'location' | 'craving' | 'end'>('init');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleBotResponse("Salut ! 👋 Bienvenue chez Tasty Food. Pour commencer, dans quelle zone êtes-vous ?", 'location');
    }
  }, [isOpen, messages.length]);

  const handleBotResponse = (text: string, nextStep: 'init' | 'location' | 'craving' | 'end', platforms?: PlatformLink[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text, 
        sender: 'bot',
        showPlatforms: platforms
      }]);
      setIsTyping(false);
      setStep(nextStep);
    }, 800); 
  };

  const handleUserChoice = (choiceLabel: string, value?: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: choiceLabel, sender: 'user' }]);

    if (step === 'location' && value) {
      setSelectedLoc(value);
      handleBotResponse(`Top, on s'occupe de vous à ${LOCATIONS[value].name} ! 🍔 Qu'est-ce qui vous ferait plaisir ?`, 'craving');
    } 
    else if (step === 'craving') {
      if (selectedLoc) {
        const locData = LOCATIONS[selectedLoc];
        handleBotResponse(
          `Excellent choix ! 🤤 Voici toutes les options disponibles pour commander à ${locData.name} :`, 
          'end',
          locData.platforms // On passe la liste des plateformes ici
        );
      }
    }
  };

  const resetChat = () => {
    setMessages([]);
    setStep('init');
    handleBotResponse("On repart à zéro ! 🔄 Dans quelle ville êtes-vous ?", 'location');
  };

  return (
    <>
      {/* BOUTON FLOTTANT */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center
          ${isOpen ? 'bg-black text-white rotate-90' : 'bg-yellow-500 text-black rotate-0 hover:bg-yellow-400'}
        `}
        aria-label="Ouvrir le chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} strokeWidth={2.5} />}
        {!isOpen && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>
        )}
      </button>

      {/* FENÊTRE DE CHAT */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[90vw] md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans">
          
          {/* Header */}
          <div className="bg-black p-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-black">🍔</div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">Tasty Bot</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-400 text-xs font-medium">Assistant Commande</span>
                </div>
              </div>
            </div>
            <button onClick={resetChat} className="text-gray-500 hover:text-white transition-colors" title="Recommencer">
              <RefreshCcw size={16} />
            </button>
          </div>

          {/* Zone de Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 min-h-[300px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-black text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  
                  {/* --- AFFICHAGE MULTI-PLATEFORMES --- */}
                  {msg.showPlatforms && (
                    <div className="mt-3 flex flex-col gap-2">
                      {msg.showPlatforms.map((platform, idx) => (
                        <a 
                          key={idx}
                          href={platform.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${platform.color} hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm flex items-center justify-between text-xs`}
                        >
                          <span className="flex items-center gap-2">
                            <ShoppingBag size={14} />
                            {platform.name}
                          </span>
                          <ExternalLink size={14}/>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center h-10">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone d'Actions (Chips) */}
          <div className="p-3 bg-white border-t border-gray-100">
            {step === 'location' && !isTyping && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(LOCATIONS).map(([key, data]) => (
                  <button 
                    key={key}
                    onClick={() => handleUserChoice(data.name, key)}
                    className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-yellow-400 hover:text-black hover:border-yellow-500 text-gray-700 text-xs font-semibold py-3 px-2 rounded-xl border border-gray-200 transition-all duration-200"
                  >
                    <MapPin size={14} /> {data.name}
                  </button>
                ))}
              </div>
            )}

            {step === 'craving' && !isTyping && (
              <div className="flex flex-wrap gap-2 justify-center">
                {['Un Smash Burger 🍔', 'Des Tacos 🌮', 'Le Crousty 🍗', 'Juste des frites 🍟'].map((item) => (
                  <button 
                    key={item}
                    onClick={() => handleUserChoice(item)}
                    className="bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-medium py-2 px-4 rounded-full border border-gray-200 transition-all duration-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {step === 'end' && (
              <p className="text-center text-xs text-gray-400 italic">
                Choisissez votre plateforme préférée ci-dessus
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;