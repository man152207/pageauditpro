
# Implement Sitemap at pagelyzer.io/sitemap.xml

## Overview
This plan implements proper routing to serve the dynamic sitemap from the main domain (`https://pagelyzer.io/sitemap.xml`) instead of the Supabase edge function URL. This is better for SEO because search engines prefer sitemaps hosted on the same domain.

## Implementation Approach

Since we're using a React SPA with Vite, we have two options:

1. **Recommended: Create a SitemapPage component** that fetches from the edge function and serves XML
2. Create a static redirect in public folder (not ideal for dynamic content)

We'll go with Option 1 as it allows serving dynamic content while keeping the URL on the main domain.

## Changes Required

### 1. Create SitemapPage Component
Create a new page component that:
- Fetches sitemap XML from the edge function
- Renders it with proper `Content-Type: application/xml`
- Uses `useEffect` to redirect bots to raw XML response

```text
File: src/pages/SitemapPage.tsx

- Fetches from: https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/sitemap
- Returns XML content directly
- Sets document content type for XML
```

### 2. Add Route in App.tsx
Add a new route for `/sitemap.xml`:

```text
<Route path="/sitemap.xml" element={<SitemapPage />} />
```

### 3. Update robots.txt
Add sitemap reference to `public/robots.txt`:

```text
Sitemap: https://pagelyzer.io/sitemap.xml
```

### 4. Update SEO Settings Default
Update `useSEO.ts` to set default sitemap URL:

```text
sitemap_url: 'https://pagelyzer.io/sitemap.xml'
```

### 5. Update Sitemap Edge Function
Update the edge function to include the correct sitemap URL in its output and add a reference in the XML header if needed.

## Technical Details

### SitemapPage Component Logic

```text
1. On component mount, fetch sitemap from edge function
2. Create a Blob with XML content
3. Replace entire document with XML content
4. Set proper Content-Type header via meta tag
```

For search engine crawlers, this approach works because:
- The URL is `https://pagelyzer.io/sitemap.xml`
- The response contains valid XML
- Crawlers will see the sitemap content

### Alternative: Direct Blob URL Redirect

For better XML handling, we can:
1. Fetch the XML from edge function
2. Create a data URL or Blob URL
3. Replace `window.location` with raw XML view

### Vercel/Netlify Headers (if deployed there)
If using a hosting platform like Vercel, we could add rewrite rules in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://wrjqheztddmazlifbzbi.supabase.co/functions/v1/sitemap"
    }
  ]
}
```

However, since we're on Lovable, we'll use the React component approach.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/SitemapPage.tsx` | Create | New page to serve sitemap XML |
| `src/App.tsx` | Modify | Add route for /sitemap.xml |
| `public/robots.txt` | Modify | Add Sitemap directive |
| `src/hooks/useSEO.ts` | Modify | Update default sitemap_url |

## SEO Benefits

1. **Domain Authority**: Sitemap on main domain improves domain authority signals
2. **Crawler Trust**: Search engines trust sitemaps more when hosted on the same domain
3. **robots.txt Integration**: Direct reference from robots.txt to sitemap
4. **Consistent Indexing**: All URLs in sitemap match the domain serving it

## Testing Steps

After implementation:
1. Visit `https://pagelyzer.io/sitemap.xml`
2. Verify XML content is displayed correctly
3. Use Google Search Console's sitemap testing tool
4. Verify all URLs in sitemap are correct and accessible
