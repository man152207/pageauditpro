import { useEffect } from 'react';

const SITEMAP_EDGE_FUNCTION_URL = 'https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/sitemap';

const SitemapPage = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        const response = await fetch(SITEMAP_EDGE_FUNCTION_URL);
        const xmlContent = await response.text();
        
        // Replace entire document with XML content
        document.open('text/xml');
        document.write(xmlContent);
        document.close();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        // Fallback: redirect to edge function directly
        window.location.href = SITEMAP_EDGE_FUNCTION_URL;
      }
    };

    fetchAndServeSitemap();
  }, []);

  // Return null as we're replacing the document
  return null;
};

export default SitemapPage;
