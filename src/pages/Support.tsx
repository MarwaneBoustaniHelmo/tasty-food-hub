import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';

const Support: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home with ticket param preserved
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    
    if (ticket) {
      // Redirect to home page, the chatbot will pick up the ticket param
      navigate(`/?ticket=${ticket}`, { replace: true });
    } else {
      // No ticket, just go to home
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <SEOHead
        title="Support Client - Tasty Food"
        description="Support client et assistance pour vos commandes Tasty Food à Liège."
        canonical="/support"
      />
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
        <p className="mt-4 text-gray-600">Redirection vers votre conversation...</p>
      </div>
    </>
  );
};

export default Support;
