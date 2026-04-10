import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get canonical URL from settings
    const { data: settingData } = await supabaseAdmin
      .from("settings")
      .select("value_encrypted")
      .eq("scope", "global")
      .eq("key", "canonical_url")
      .maybeSingle();

    const baseUrl = settingData?.value_encrypted || "https://pagelyzer.io";
    const currentDate = new Date().toISOString().split("T")[0];

    // Fetch all page_seo routes for dynamic static pages
    const { data: pageSeoRoutes } = await supabaseAdmin
      .from("page_seo")
      .select("route, updated_at");

    // Fetch published blog posts
    const { data: blogPosts } = await supabaseAdmin
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("published", true);

    // Fetch public reports
    const { data: publicReports } = await supabaseAdmin
      .from("reports")
      .select("share_slug, created_at")
      .eq("is_public", true)
      .not("share_slug", "is", null);

    // Priority map for known routes
    const priorityMap: Record<string, { priority: string; changefreq: string }> = {
      "/": { priority: "1.0", changefreq: "daily" },
      "/features": { priority: "0.8", changefreq: "weekly" },
      "/pricing": { priority: "0.9", changefreq: "weekly" },
      "/sample-report": { priority: "0.7", changefreq: "weekly" },
      "/faq": { priority: "0.6", changefreq: "monthly" },
      "/contact": { priority: "0.5", changefreq: "monthly" },
      "/blog": { priority: "0.8", changefreq: "daily" },
      "/privacy-policy": { priority: "0.4", changefreq: "yearly" },
      "/terms-of-service": { priority: "0.4", changefreq: "yearly" },
      "/data-deletion": { priority: "0.3", changefreq: "yearly" },
    };

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add page_seo routes
    if (pageSeoRoutes) {
      for (const page of pageSeoRoutes) {
        const config = priorityMap[page.route] || { priority: "0.5", changefreq: "monthly" };
        const lastmod = page.updated_at
          ? new Date(page.updated_at).toISOString().split("T")[0]
          : currentDate;
        sitemap += `  <url>
    <loc>${baseUrl}${page.route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>
`;
      }
    }

    // Add blog posts
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at
          ? new Date(post.updated_at).toISOString().split("T")[0]
          : currentDate;
        sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add public reports
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

    const totalUrls = (pageSeoRoutes?.length || 0) + (blogPosts?.length || 0) + (publicReports?.length || 0);
    console.log(`Sitemap generated with ${totalUrls} URLs`);

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pagelyzer.io/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/xml" } }
    );
  }
});
