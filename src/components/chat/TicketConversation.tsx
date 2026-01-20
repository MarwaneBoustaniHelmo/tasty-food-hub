import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  getSupportRequest,
  getSupportMessages,
  addSupportMessage,
  subscribeToMessages,
  checkRequestTimeout,
  escalateTimedOutRequest,
  type SupportRequest,
  type SupportMessage,
} from '@/services/supportRequests';
import { useToast } from '@/hooks/use-toast';

interface TicketConversationProps {
  ticketId: string;
  onClose: () => void;
}

export const TicketConversation: React.FC<TicketConversationProps> = ({ ticketId, onClose }) => {
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTicketData();
    checkTimeout();

    // Subscribe to real-time messages
    const subscription = subscribeToMessages(ticketId, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      
      // If agent replied, hide timeout warning
      if (newMsg.author_type === 'agent') {
        setIsTimedOut(false);
        setShowEscalation(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTicketData = async () => {
    setIsLoading(true);
    try {
      const [requestData, messagesData] = await Promise.all([
        getSupportRequest(ticketId),
        getSupportMessages(ticketId),
      ]);

      if (!requestData) {
        toast({
          title: 'Ticket introuvable',
          description: 'Ce ticket n\'existe pas ou a été supprimé.',
          variant: 'destructive',
        });
        onClose();
        return;
      }

      setRequest(requestData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger le ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkTimeout = async () => {
    const timedOut = await checkRequestTimeout(ticketId, 24); // 24 hours
    setIsTimedOut(timedOut);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const message = await addSupportMessage(ticketId, newMessage, 'user');
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!request) return;

    const confirmEscalate = window.confirm(
      'Voulez-vous ouvrir une nouvelle demande pour qu\'un autre agent puisse vous aider ?'
    );

    if (!confirmEscalate) return;

    try {
      const newRequest = await escalateTimedOutRequest(
        ticketId,
        request.email,
        'Pas de réponse au ticket précédent. Merci de traiter cette demande en priorité.'
      );

      toast({
        title: '✅ Nouvelle demande créée',
        description: 'Un agent va prendre en charge votre demande.',
      });

      // Redirect to new ticket
      window.location.href = `?ticket=${newRequest.id}`;
    } catch (error) {
      console.error('Error escalating:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer une nouvelle demande.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      answered: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      timeout: 'bg-red-100 text-red-800',
    };

    const icons = {
      open: <Clock className="w-3 h-3" />,
      answered: <CheckCircle className="w-3 h-3" />,
      closed: <CheckCircle className="w-3 h-3" />,
      timeout: <AlertCircle className="w-3 h-3" />,
    };

    const labels = {
      open: 'En attente',
      answered: 'Répondu',
      closed: 'Fermé',
      timeout: 'Expiré',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-4 text-center text-gray-600">
        Ticket introuvable
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Ticket #{ticketId.slice(0, 8)}</h3>
          {getStatusBadge(request.status)}
        </div>
        <p className="text-xs text-gray-600">
          Créé le {new Date(request.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Timeout warning */}
      {isTimedOut && !showEscalation && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 m-3">
          <p className="text-sm text-orange-800">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            L'agent met plus de temps que prévu à répondre.
          </p>
          <button
            onClick={() => setShowEscalation(true)}
            className="text-xs text-orange-600 underline mt-1 hover:text-orange-800"
          >
            Ouvrir une nouvelle demande ?
          </button>
        </div>
      )}

      {showEscalation && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 m-3">
          <p className="text-sm text-red-800 mb-2">
            <strong>Escalade de la demande</strong><br />
            Voulez-vous qu'un autre agent prenne en charge votre demande ?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEscalate}
              className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Oui, créer une nouvelle demande
            </button>
            <button
              onClick={() => setShowEscalation(false)}
              className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              Non, attendre
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Initial request message */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
          <p className="text-xs text-blue-600 font-medium mb-1">Votre demande initiale :</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{request.message}</p>
        </div>

        {/* Conversation messages */}
        {messages.map((msg) => {
          const isUser = msg.author_type === 'user';
          const isAgent = msg.author_type === 'agent';

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isUser
                    ? 'bg-yellow-500 text-black'
                    : isAgent
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-100'
                }`}
              >
                {isAgent && (
                  <p className="text-xs text-green-600 font-medium mb-1">
                    👤 Agent Tasty Food
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatMessageTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {request.status !== 'closed' && request.status !== 'timeout' && (
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      )}

      {(request.status === 'closed' || request.status === 'timeout') && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 text-center text-sm text-gray-600">
          Cette conversation est fermée.
        </div>
      )}

      <button
        onClick={onClose}
        className="m-3 mt-0 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        ← Retour au chat
      </button>
    </div>
  );
};
