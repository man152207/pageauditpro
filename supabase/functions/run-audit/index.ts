import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RUN-AUDIT] ${step}${detailsStr}`);
};

// Calculate engagement score (0-100)
function calculateEngagementScore(metrics: any): number {
  const { totalEngagements, followers, postsCount } = metrics;
  if (!followers || !postsCount) return 50;
  
  const avgEngagementPerPost = totalEngagements / postsCount;
  const engagementRate = (avgEngagementPerPost / followers) * 100;
  
  if (engagementRate >= 5) return 100;
  if (engagementRate >= 3) return 85;
  if (engagementRate >= 1) return 65;
  if (engagementRate >= 0.5) return 45;
  return Math.max(20, engagementRate * 20);
}

// Calculate consistency score based on posting frequency
function calculateConsistencyScore(postsPerWeek: number): number {
  if (postsPerWeek >= 7) return 100;
  if (postsPerWeek >= 5) return 85;
  if (postsPerWeek >= 3) return 70;
  if (postsPerWeek >= 1) return 50;
  return 20;
}

// Calculate readiness score based on page optimization
function calculateReadinessScore(pageInfo: any): number {
  let score = 0;
  if (pageInfo.about) score += 25;
  if (pageInfo.category) score += 25;
  if (pageInfo.website) score += 25;
  if (pageInfo.phone) score += 25;
  return score;
}

// Generate recommendations based on scores
function generateRecommendations(scores: any, metrics: any, isPro: boolean): any[] {
  const recommendations: any[] = [];
  
  // Basic recommendations (visible to all users)
  if (scores.engagement < 50) {
    recommendations.push({
      priority: "high",
      category: "engagement",
      title: "Improve Post Engagement",
      description: "Your engagement rate is below average. Focus on creating more interactive content.",
      isPro: false,
    });
  }
  
  if (scores.consistency < 60) {
    recommendations.push({
      priority: "high",
      category: "consistency",
      title: "Increase Posting Frequency",
      description: "Post more regularly to maintain audience interest. Aim for 3-5 posts per week.",
      isPro: false,
    });
  }

  // Pro-only recommendations with detailed actions
  if (isPro) {
    if (metrics.topPostType) {
      recommendations.push({
        priority: "medium",
        category: "content",
        title: `Focus on ${metrics.topPostType} Content`,
        description: `Your ${metrics.topPostType} posts perform 40% better than other content types.`,
        isPro: true,
      });
    }

    recommendations.push({
      priority: "medium",
      category: "timing",
      title: "Optimize Posting Times",
      description: "Based on your audience activity, the best times to post are weekdays 6-8 PM.",
      isPro: true,
    });

    if (scores.readiness < 75) {
      recommendations.push({
        priority: "low",
        category: "optimization",
        title: "Complete Page Profile",
        description: "Add missing profile information to improve page discoverability.",
        isPro: true,
      });
    }
  }

  return recommendations;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;
    logStep("User authenticated", { userId });

    const { connection_id, date_range } = await req.json();

    if (!connection_id) {
      return new Response(
        JSON.stringify({ error: "connection_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse date range if provided (for UI context - stored in computed_metrics)
    const requestedRange = date_range || { preset: '30d' };
    logStep("Date range requested", requestedRange);

    // Check subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    const isPro = !!subscription && subscription.plan?.billing_type !== "free";
    logStep("Subscription check", { isPro });

    // Check for free audit grant for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthStr = startOfMonth.toISOString().split('T')[0];

    const { data: freeGrant } = await supabase
      .from("free_audit_grants")
      .select("id")
      .eq("user_id", userId)
      .eq("grant_month", monthStr)
      .maybeSingle();

    const hasFreeAuditGrant = !!freeGrant;
    logStep("Free audit grant check", { hasFreeAuditGrant, month: monthStr });

    // Check usage limits for free users (skip if they have a free grant)
    if (!isPro && !hasFreeAuditGrant) {
      const { count } = await supabase
        .from("audits")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      const limits = (subscription?.plan?.limits as any) || { audits_per_month: 3 };
      const auditsLimit = limits.audits_per_month || 3;

      if ((count || 0) >= auditsLimit) {
        return new Response(
          JSON.stringify({ 
            error: "Monthly audit limit reached",
            limit: auditsLimit,
            used: count,
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from("fb_connections")
      .select("*")
      .eq("id", connection_id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Connection not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Connection found", { pageId: connection.page_id, pageName: connection.page_name });

    const pageToken = connection.access_token_encrypted;
    const pageId = connection.page_id;

    // Fetch page info from Facebook
    let pageInfo: any = {};
    let insights: any[] = [];
    let posts: any[] = [];
    let dataAvailability: any = {};

    try {
      const pageInfoUrl = `https://graph.facebook.com/v19.0/${pageId}?` +
        `fields=name,followers_count,fan_count,about,category,website,phone&` +
        `access_token=${pageToken}`;
      
      const pageInfoRes = await fetch(pageInfoUrl);
      pageInfo = await pageInfoRes.json();
      dataAvailability.pageInfo = !pageInfo.error;
      logStep("Page info fetched", { success: !pageInfo.error });
    } catch (e) {
      logStep("Page info fetch failed", { error: e });
      dataAvailability.pageInfo = false;
    }

    try {
      const insightsUrl = `https://graph.facebook.com/v19.0/${pageId}/insights?` +
        `metric=page_impressions,page_engaged_users,page_post_engagements,page_fans&` +
        `period=day&date_preset=last_30d&` +
        `access_token=${pageToken}`;
      
      const insightsRes = await fetch(insightsUrl);
      const insightsData = await insightsRes.json();
      insights = insightsData.data || [];
      dataAvailability.insights = !insightsData.error;
      logStep("Insights fetched", { success: !insightsData.error, count: insights.length });
    } catch (e) {
      logStep("Insights fetch failed", { error: e });
      dataAvailability.insights = false;
    }

    try {
      // Enhanced posts fetch with permalink_url, full_picture, and attachments
      const postsUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?` +
        `fields=id,message,created_time,shares,likes.summary(true),comments.summary(true),type,` +
        `permalink_url,full_picture,attachments{media_type,media,url,subattachments}&` +
        `limit=25&` +
        `access_token=${pageToken}`;
      
      const postsRes = await fetch(postsUrl);
      const postsData = await postsRes.json();
      posts = postsData.data || [];
      dataAvailability.posts = !postsData.error;
      logStep("Posts fetched with media", { success: !postsData.error, count: posts.length });
    } catch (e) {
      logStep("Posts fetch failed", { error: e });
      dataAvailability.posts = false;
    }

    // Fetch post-level insights for paid/organic breakdown (best effort)
    let postInsights: Record<string, any> = {};
    if (posts.length > 0) {
      try {
        // Fetch insights for up to 10 posts (rate limit consideration)
        const postIds = posts.slice(0, 10).map((p: any) => p.id);
        for (const postId of postIds) {
          try {
            const insightUrl = `https://graph.facebook.com/v19.0/${postId}/insights?` +
              `metric=post_impressions,post_impressions_organic,post_impressions_paid,post_engaged_users&` +
              `access_token=${pageToken}`;
            const insightRes = await fetch(insightUrl);
            const insightData = await insightRes.json();
            if (!insightData.error && insightData.data) {
              postInsights[postId] = {};
              insightData.data.forEach((metric: any) => {
                postInsights[postId][metric.name] = metric.values?.[0]?.value || 0;
              });
            }
          } catch (e) {
            // Individual post insight failure is non-blocking
          }
        }
        dataAvailability.postInsights = Object.keys(postInsights).length > 0;
        logStep("Post insights fetched", { count: Object.keys(postInsights).length });
      } catch (e) {
        logStep("Post insights fetch failed", { error: e });
        dataAvailability.postInsights = false;
      }
    }

    // Demographics will be fetched later after hasProAccess is calculated
    let demographics: any = null;

    // Calculate metrics
    const followers = pageInfo.followers_count || pageInfo.fan_count || 1000;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    posts.forEach((post: any) => {
      totalLikes += post.likes?.summary?.total_count || 0;
      totalComments += post.comments?.summary?.total_count || 0;
      totalShares += post.shares?.count || 0;
    });

    const totalEngagements = totalLikes + totalComments + totalShares;
    const postsCount = posts.length || 1;

    // Calculate posts per week (based on first and last post dates)
    let postsPerWeek = 3;
    if (posts.length >= 2) {
      const firstPost = new Date(posts[posts.length - 1].created_time);
      const lastPost = new Date(posts[0].created_time);
      const daysDiff = Math.max(1, (lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24));
      postsPerWeek = Math.round((posts.length / daysDiff) * 7 * 10) / 10;
    }

    const metrics = {
      followers,
      totalEngagements,
      totalLikes,
      totalComments,
      totalShares,
      postsCount,
      postsPerWeek,
      avgEngagementPerPost: Math.round((totalEngagements / postsCount) * 10) / 10,
      engagementRate: Math.round((totalEngagements / postsCount / followers) * 10000) / 100,
      topPostType: posts[0]?.type || "status",
    };

    // Calculate scores
    const engagementScore = Math.round(calculateEngagementScore(metrics));
    const consistencyScore = Math.round(calculateConsistencyScore(postsPerWeek));
    const readinessScore = Math.round(calculateReadinessScore(pageInfo));
    const overallScore = Math.round(engagementScore * 0.4 + consistencyScore * 0.35 + readinessScore * 0.25);

    const scores = {
      overall: overallScore,
      engagement: engagementScore,
      consistency: consistencyScore,
      readiness: readinessScore,
    };

    logStep("Scores calculated", scores);

    // Generate recommendations - include Pro recommendations if user has grant OR subscription
    const hasProAccess = isPro || hasFreeAuditGrant;
    const recommendations = generateRecommendations(scores, metrics, hasProAccess);

    // Fetch demographics for Pro users (now that hasProAccess is defined)
    if (hasProAccess) {
      try {
        const demoUrl = `https://graph.facebook.com/v19.0/${pageId}/insights?` +
          `metric=page_fans_gender_age,page_fans_city,page_fans_country&` +
          `period=lifetime&access_token=${pageToken}`;
        
        const demoRes = await fetch(demoUrl);
        const demoData = await demoRes.json();
        
        if (!demoData.error && demoData.data) {
          const genderAge = demoData.data.find((d: any) => d.name === 'page_fans_gender_age');
          const cities = demoData.data.find((d: any) => d.name === 'page_fans_city');
          const countries = demoData.data.find((d: any) => d.name === 'page_fans_country');
          
          demographics = {
            genderAge: genderAge?.values?.[0]?.value || null,
            cities: cities?.values?.[0]?.value || null,
            countries: countries?.values?.[0]?.value || null,
          };
          dataAvailability.demographics = true;
        } else {
          dataAvailability.demographics = false;
        }
        logStep("Demographics fetched", { success: !!demographics });
      } catch (e) {
        logStep("Demographics fetch failed", { error: e });
        dataAvailability.demographics = false;
      }
    }

    // Create audit record
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert({
        user_id: userId,
        fb_connection_id: connection_id,
        audit_type: "automatic",
        page_name: connection.page_name,
        page_url: `https://facebook.com/${pageId}`,
        input_data: {
          followers,
          postsPerWeek,
          totalLikes,
          totalComments,
          totalShares,
          postsAnalyzed: postsCount,
        },
        score_total: overallScore,
        score_breakdown: scores,
        recommendations: recommendations.filter(r => !r.isPro || hasProAccess),
        is_pro_unlocked: hasProAccess,
      })
      .select()
      .single();

    if (auditError) {
      logStep("Audit creation failed", { error: auditError.message });
      return new Response(
        JSON.stringify({ error: "Failed to create audit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Audit created", { auditId: audit.id });

    // Store detailed metrics for Pro users OR users with free audit grants
    if (hasProAccess) {
      // Calculate paid vs organic totals
      let totalPaidImpressions = 0;
      let totalOrganicImpressions = 0;
      Object.values(postInsights).forEach((insight: any) => {
        totalPaidImpressions += insight.post_impressions_paid || 0;
        totalOrganicImpressions += insight.post_impressions_organic || 0;
      });
      const totalImpressions = totalPaidImpressions + totalOrganicImpressions;
      const paidVsOrganic = totalImpressions > 0 ? {
        paid: Math.round((totalPaidImpressions / totalImpressions) * 100),
        organic: Math.round((totalOrganicImpressions / totalImpressions) * 100),
        totalPaid: totalPaidImpressions,
        totalOrganic: totalOrganicImpressions,
      } : null;

      // Calculate post type stats for creative analysis
      const postTypeStats: Record<string, { total: number; count: number }> = {};
      posts.forEach((p: any) => {
        const type = p.type || 'status';
        if (!postTypeStats[type]) {
          postTypeStats[type] = { total: 0, count: 0 };
        }
        const eng = (p.likes?.summary?.total_count || 0) + 
                    (p.comments?.summary?.total_count || 0) + 
                    (p.shares?.count || 0);
        postTypeStats[type].total += eng;
        postTypeStats[type].count += 1;
      });
      const postTypeAnalysis = Object.entries(postTypeStats).map(([type, stats]) => ({
        type,
        avgEngagement: Math.round(stats.total / stats.count),
        count: stats.count,
      }));

      await supabase.from("audit_metrics").insert({
        audit_id: audit.id,
        raw_metrics: {
          pageInfo,
          insights,
          posts: posts.map((p: any) => {
            const pInsight = postInsights[p.id] || {};
            return {
              id: p.id,
              type: p.type,
              created_time: p.created_time,
              message: p.message,
              permalink_url: p.permalink_url,
              full_picture: p.full_picture,
              media_type: p.attachments?.data?.[0]?.media_type || p.type,
              likes: p.likes?.summary?.total_count || 0,
              comments: p.comments?.summary?.total_count || 0,
              shares: p.shares?.count || 0,
              // Post-level insights (if available)
              impressions: pInsight.post_impressions || null,
              impressions_organic: pInsight.post_impressions_organic || null,
              impressions_paid: pInsight.post_impressions_paid || null,
              engaged_users: pInsight.post_engaged_users || null,
              is_paid: (pInsight.post_impressions_paid || 0) > 0,
            };
          }),
        },
        computed_metrics: {
          ...metrics,
          requestedRange,
          paidVsOrganic,
          postTypeAnalysis,
          benchmarks: {
            postingFrequency: {
              current: postsPerWeek,
              target: 4,
              unit: 'posts/week',
            },
            engagementRate: {
              current: metrics.engagementRate,
              min: 1,
              max: 3,
            },
          },
        },
        data_availability: dataAvailability,
        demographics: demographics,
      });
      logStep("Metrics stored for Pro/Grant user with enhanced data");
    }

    // Create report record
    await supabase.from("reports").insert({
      audit_id: audit.id,
      is_public: false,
    });

    return new Response(
      JSON.stringify({
        success: true,
        audit_id: audit.id,
        scores,
        is_pro: isPro,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
