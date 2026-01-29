import React from 'react';
import SEOHead from '@/components/SEOHead';
import Section from '@/components/Section';

const Support: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Support Client - Tasty Food"
        description="Support client et assistance pour vos commandes Tasty Food à Liège."
        canonical="/support"
      />
      <Section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bebas text-gold mb-6">
            Support Client
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Notre système de support sera bientôt disponible.
          </p>
          <p className="text-gray-500">
            En attendant, contactez-nous via la page de contact ou par téléphone.
          </p>
        </div>
      </Section>
    </>
  );
};

export default Support;
