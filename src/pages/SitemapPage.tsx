import { useEffect } from 'react';

const SITEMAP_EDGE_FUNCTION_URL = 'https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/sitemap';

/**
 * SitemapPage redirects to the Supabase Edge Function that generates the XML sitemap.
 * This ensures proper XML Content-Type headers are served by the edge function.
 */
const SitemapPage = () => {
  useEffect(() => {
    // Redirect directly to the edge function which serves proper XML
    window.location.replace(SITEMAP_EDGE_FUNCTION_URL);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting to sitemap...</p>
    </div>
  );
};

export default SitemapPage;
