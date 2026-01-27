import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/features", priority: "0.8", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/auth", priority: "0.5", changefreq: "monthly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/audit", priority: "0.8", changefreq: "weekly" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to get canonical_url from settings, fallback to default
    const { data: settingData } = await supabaseAdmin
      .from("settings")
      .select("value_encrypted")
      .eq("scope", "global")
      .eq("key", "canonical_url")
      .maybeSingle();

    const baseUrl = settingData?.value_encrypted || "https://pagelyzer.io";
    const currentDate = new Date().toISOString().split("T")[0];

    // Fetch public reports for dynamic URLs
    const { data: publicReports } = await supabaseAdmin
      .from("reports")
      .select("share_slug, created_at")
      .eq("is_public", true)
      .not("share_slug", "is", null);

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add public reports as dynamic pages
    if (publicReports && publicReports.length > 0) {
      for (const report of publicReports) {
        const lastmod = report.created_at
          ? new Date(report.created_at).toISOString().split("T")[0]
          : currentDate;
        
        sitemap += `  <url>
    <loc>${baseUrl}/report/${report.share_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    console.log(`Sitemap generated with ${staticPages.length + (publicReports?.length || 0)} URLs`);

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: unknown) {
    console.error("Error generating sitemap:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pagelyzer.io/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/xml" 
        } 
      }
    );
  }
});
