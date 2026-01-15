import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'restaurant' | 'article';
  image?: string;
  noIndex?: boolean;
}

/**
 * SEO Component for dynamic meta tags per page
 * Uses react-helmet-async for SPA-compatible SEO
 */
const SEOHead = ({
  title,
  description,
  canonical,
  type = 'website',
  image = 'https://lovable.dev/opengraph-image-p98pqg.png',
  noIndex = false,
}: SEOHeadProps) => {
  const siteName = 'Tasty Food Liège';
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = 'https://tastyfoodliege.be';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={`${baseUrl}${canonical}`} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="fr_BE" />
      {canonical && <meta property="og:url" content={`${baseUrl}${canonical}`} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="BE-WLG" />
      <meta name="geo.placename" content="Liège" />
    </Helmet>
  );
};

export default SEOHead;
