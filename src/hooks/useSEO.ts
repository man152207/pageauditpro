import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SEOSettings {
  // Basic SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  
  // OpenGraph
  og_image_url: string;
  og_type: string;
  og_site_name: string;
  
  // Twitter Card
  twitter_card: string;
  twitter_site: string;
  
  // Robots
  robots_index: boolean;
  robots_follow: boolean;
  robots_txt_content: string;
  
  // Verification
  google_verification: string;
  bing_verification: string;
  yandex_verification: string;
  pinterest_verification: string;
  
  // Schema
  schema_type: string;
  schema_organization: string;
  
  // Tracking
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  
  // Favicon
  favicon_url: string;
  
  // Sitemap
  sitemap_url: string;
}

const defaultSEO: SEOSettings = {
  seo_title: 'Pagelyzer - Smart Facebook Page Audit Platform',
  seo_description: 'Get instant page health scores, engagement analysis, and AI-powered recommendations to grow your Facebook audience.',
  seo_keywords: 'facebook audit, page analysis, social media, engagement, facebook insights',
  canonical_url: '',
  og_image_url: '',
  og_type: 'website',
  og_site_name: 'Pagelyzer',
  twitter_card: 'summary_large_image',
  twitter_site: '',
  robots_index: true,
  robots_follow: true,
  robots_txt_content: '',
  google_verification: '',
  bing_verification: '',
  yandex_verification: '',
  pinterest_verification: '',
  schema_type: 'WebApplication',
  schema_organization: '',
  google_analytics_id: '',
  google_tag_manager_id: '',
  facebook_pixel_id: '',
  favicon_url: '/favicon.ico',
  sitemap_url: '',
};

export function useSEO() {
  const [seo, setSeo] = useState<SEOSettings>(defaultSEO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value_encrypted')
          .eq('scope', 'global')
          .like('key', 'seo_%')
          .or('key.like.og_%,key.like.google_%,key.like.bing_%,key.like.yandex_%,key.like.pinterest_%,key.like.twitter_%,key.like.facebook_%,key.like.robots_%,key.like.schema_%,key.like.favicon_%,key.like.sitemap_%,key.like.canonical_%');

        if (error) throw error;

        if (data) {
          const settings = { ...defaultSEO };
          data.forEach((item) => {
            const key = item.key as keyof SEOSettings;
            if (key in settings) {
              if (key === 'robots_index' || key === 'robots_follow') {
                (settings[key] as boolean) = item.value_encrypted === 'true';
              } else {
                (settings[key] as string) = item.value_encrypted || '';
              }
            }
          });
          setSeo(settings);
        }
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSEO();
  }, []);

  return { seo, loading };
}

export function useApplySEO(pageTitle?: string, pageDescription?: string, pageImage?: string) {
  const { seo, loading } = useSEO();

  useEffect(() => {
    if (loading) return;

    const title = pageTitle || seo.seo_title;
    const description = pageDescription || seo.seo_description;
    const image = pageImage || seo.og_image_url;

    // Set title
    document.title = title;

    // Helper to set/update meta tag
    const setMeta = (name: string, content: string, property = false) => {
      if (!content) return;
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta
    setMeta('description', description);
    setMeta('keywords', seo.seo_keywords);
    setMeta('robots', `${seo.robots_index ? 'index' : 'noindex'}, ${seo.robots_follow ? 'follow' : 'nofollow'}`);

    // OpenGraph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', seo.og_type, true);
    setMeta('og:site_name', seo.og_site_name, true);
    if (image) setMeta('og:image', image, true);
    if (seo.canonical_url) setMeta('og:url', seo.canonical_url, true);

    // Twitter Card
    setMeta('twitter:card', seo.twitter_card);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
    if (seo.twitter_site) setMeta('twitter:site', seo.twitter_site);

    // Verification tags
    if (seo.google_verification) setMeta('google-site-verification', seo.google_verification);
    if (seo.bing_verification) setMeta('msvalidate.01', seo.bing_verification);
    if (seo.yandex_verification) setMeta('yandex-verification', seo.yandex_verification);
    if (seo.pinterest_verification) setMeta('p:domain_verify', seo.pinterest_verification);

    // Canonical URL
    if (seo.canonical_url) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = seo.canonical_url;
    }

    // JSON-LD Schema
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaScript) {
      schemaScript.remove();
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': seo.schema_type || 'WebApplication',
      name: seo.og_site_name || 'Pagelyzer',
      description: description,
      url: seo.canonical_url || window.location.origin,
      applicationCategory: 'BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    };

    const newScript = document.createElement('script');
    newScript.type = 'application/ld+json';
    newScript.textContent = JSON.stringify(schema);
    document.head.appendChild(newScript);

    // Google Analytics
    if (seo.google_analytics_id && !document.querySelector(`script[src*="${seo.google_analytics_id}"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seo.google_analytics_id}`;
      document.head.appendChild(gaScript);

      const gaConfig = document.createElement('script');
      gaConfig.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seo.google_analytics_id}');
      `;
      document.head.appendChild(gaConfig);
    }

    // Google Tag Manager
    if (seo.google_tag_manager_id && !document.querySelector(`script[src*="${seo.google_tag_manager_id}"]`)) {
      const gtmScript = document.createElement('script');
      gtmScript.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${seo.google_tag_manager_id}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Facebook Pixel
    if (seo.facebook_pixel_id && !document.querySelector(`script[data-fb-pixel="${seo.facebook_pixel_id}"]`)) {
      const fbScript = document.createElement('script');
      fbScript.setAttribute('data-fb-pixel', seo.facebook_pixel_id);
      fbScript.textContent = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${seo.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

  }, [seo, loading, pageTitle, pageDescription, pageImage]);

  return { seo, loading };
}
