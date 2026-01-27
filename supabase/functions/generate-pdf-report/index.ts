import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  audit_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;

    const { audit_id }: ReportRequest = await req.json();

    if (!audit_id) {
      return new Response(
        JSON.stringify({ error: "audit_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch audit data
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", audit_id)
      .eq("user_id", userId)
      .single();

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: "Audit not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate PDF HTML content
    const scoreBreakdown = audit.score_breakdown || {};
    const recommendations = audit.recommendations || [];
    const inputData = audit.input_data || {};

    const getScoreColor = (score: number) => {
      if (score >= 80) return "#22c55e";
      if (score >= 60) return "#14b8a6";
      if (score >= 40) return "#f59e0b";
      return "#ef4444";
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Page Audit Report - ${audit.page_name || "Facebook Page"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    .page-name {
      font-size: 18px;
      color: #64748b;
    }
    .date {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 8px;
    }
    .score-section {
      text-align: center;
      margin: 40px 0;
    }
    .main-score {
      display: inline-block;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: ${getScoreColor(audit.score_total || 0)};
      color: white;
      font-size: 40px;
      font-weight: 700;
      line-height: 120px;
    }
    .score-label {
      font-size: 18px;
      color: #64748b;
      margin-top: 12px;
    }
    .breakdown {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 32px 0;
    }
    .breakdown-item {
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .breakdown-score {
      font-size: 28px;
      font-weight: 700;
      color: #3b82f6;
    }
    .breakdown-label {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .recommendation-list {
      list-style: none;
    }
    .recommendation-item {
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .recommendation-icon {
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .metric-item {
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .metric-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .pro-badge {
      display: inline-block;
      background: linear-gradient(135deg, #eab308, #f59e0b);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">📊 PageAudit Pro <span class="pro-badge">PRO</span></div>
    <div class="page-name">${audit.page_name || "Facebook Page Audit"}</div>
    <div class="date">Generated on ${new Date(audit.created_at).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })}</div>
  </div>

  <div class="score-section">
    <div class="main-score">${audit.score_total || 0}</div>
    <div class="score-label">Overall Page Score</div>
  </div>

  <div class="breakdown">
    <div class="breakdown-item">
      <div class="breakdown-score">${scoreBreakdown.engagement || 0}</div>
      <div class="breakdown-label">Engagement</div>
    </div>
    <div class="breakdown-item">
      <div class="breakdown-score">${scoreBreakdown.consistency || 0}</div>
      <div class="breakdown-label">Consistency</div>
    </div>
    <div class="breakdown-item">
      <div class="breakdown-score">${scoreBreakdown.readiness || 0}</div>
      <div class="breakdown-label">Readiness</div>
    </div>
  </div>

  <h2 class="section-title">📈 Key Metrics</h2>
  <div class="metrics-grid">
    <div class="metric-item">
      <div class="metric-label">Followers</div>
      <div class="metric-value">${inputData.followers ? parseInt(inputData.followers).toLocaleString() : "N/A"}</div>
    </div>
    <div class="metric-item">
      <div class="metric-label">Posts/Week</div>
      <div class="metric-value">${inputData.postsPerWeek || "N/A"}</div>
    </div>
    <div class="metric-item">
      <div class="metric-label">Total Engagement</div>
      <div class="metric-value">${
        ((parseInt(inputData.totalLikes) || 0) + 
         (parseInt(inputData.totalComments) || 0) + 
         (parseInt(inputData.totalShares) || 0)).toLocaleString()
      }</div>
    </div>
    <div class="metric-item">
      <div class="metric-label">Audit Type</div>
      <div class="metric-value">${audit.audit_type === "automatic" ? "Pro Automatic" : "Manual"}</div>
    </div>
  </div>

  <h2 class="section-title">💡 Recommendations</h2>
  <ul class="recommendation-list">
    ${recommendations.map((rec: string) => `
      <li class="recommendation-item">
        <div class="recommendation-icon"></div>
        <span>${rec}</span>
      </li>
    `).join("")}
  </ul>

  <div class="footer">
    <p>Generated by PageAudit Pro • Your Smart Facebook Page Audit Platform</p>
    <p>© ${new Date().getFullYear()} PageAudit Pro. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    // For now, return HTML - in production, use a PDF library like puppeteer
    // This HTML can be converted to PDF client-side using html2pdf.js
    return new Response(
      JSON.stringify({
        success: true,
        html: htmlContent,
        audit: {
          id: audit.id,
          page_name: audit.page_name,
          score_total: audit.score_total,
          created_at: audit.created_at,
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: unknown) {
    console.error("Error generating report:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
