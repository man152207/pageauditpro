
-- Create page_seo table
CREATE TABLE public.page_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  seo_content TEXT,
  schema_type TEXT DEFAULT 'WebPage',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read page_seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Admins can manage page_seo" ON public.page_seo FOR ALL USING (public.is_admin_or_above(auth.uid()));

-- Auto-update timestamp
CREATE TRIGGER update_page_seo_updated_at
BEFORE UPDATE ON public.page_seo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults
INSERT INTO public.page_seo (route, title, description, keywords, seo_content) VALUES
  ('/', 'Pagelyzer - Smart Facebook Page Audit Platform', 'Get instant page health scores, engagement analysis, and AI-powered recommendations to grow your Facebook presence.', 'facebook audit, page analysis, social media audit, engagement analysis, AI recommendations, facebook insights, page health score', 'Pagelyzer is the leading Facebook Page audit platform that provides instant health scores, deep engagement analysis, and AI-powered recommendations. Whether you are a small business owner, social media manager, or digital marketing agency, Pagelyzer helps you understand exactly what is working on your Facebook Page and what needs improvement. Our smart audit engine analyzes your posting patterns, audience engagement, content performance, and page completeness to deliver actionable insights you can implement immediately.'),
  ('/features', 'Features - Pagelyzer Facebook Audit Tools', 'Explore all free and pro features including AI insights, engagement charts, demographic analysis, and automated audits.', 'facebook audit features, AI insights, engagement charts, demographic analysis, automated audits, content planner', 'Discover the full suite of Pagelyzer audit tools designed to maximize your Facebook Page performance. From real-time engagement tracking to AI-powered content recommendations, every feature is built to help you grow your audience faster and smarter.'),
  ('/pricing', 'Pricing Plans - Pagelyzer', 'Choose the right plan for your needs. Free audits available. Pro plans with advanced AI insights, unlimited audits, and priority support.', 'pagelyzer pricing, facebook audit pricing, free audit, pro plan, social media audit cost', 'Find the perfect Pagelyzer plan for your business. Start with our free tier to experience the power of automated Facebook audits, then upgrade to Pro for unlimited audits, AI insights, demographic breakdowns, and priority support.'),
  ('/faq', 'FAQ - Frequently Asked Questions | Pagelyzer', 'Find answers to common questions about Facebook Page audits, pricing, data privacy, and how Pagelyzer works.', 'pagelyzer FAQ, facebook audit questions, how does pagelyzer work, audit privacy', 'Get answers to the most frequently asked questions about Pagelyzer. Learn how our Facebook Page audit works, what data we access, how we protect your privacy, and how to get the most out of your audit reports.'),
  ('/contact', 'Contact Us - Pagelyzer Support', 'Get in touch with the Pagelyzer team for support, feedback, or partnership inquiries.', 'contact pagelyzer, support, help, feedback', 'Reach out to the Pagelyzer team for technical support, feature requests, partnership opportunities, or general feedback. We are here to help you succeed with your Facebook Page strategy.'),
  ('/sample-report', 'Sample Audit Report - Pagelyzer', 'See what a full Pagelyzer audit report looks like with real metrics, scores, and AI recommendations.', 'sample audit report, facebook audit example, pagelyzer demo', 'Preview a complete Pagelyzer audit report with real-world metrics and AI-generated recommendations. See exactly what you will receive when you run your first Facebook Page audit.'),
  ('/privacy-policy', 'Privacy Policy - Pagelyzer', 'Read our privacy policy to understand how Pagelyzer collects, uses, and protects your data.', 'privacy policy, data protection, GDPR, facebook data', ''),
  ('/terms-of-service', 'Terms of Service - Pagelyzer', 'Read the terms and conditions for using the Pagelyzer platform.', 'terms of service, terms and conditions, legal', ''),
  ('/data-deletion', 'Data Deletion - Pagelyzer', 'Learn how to request deletion of your data from Pagelyzer.', 'data deletion, delete account, remove data, GDPR', ''),
  ('/blog', 'Blog - Pagelyzer', 'Read the latest articles on Facebook marketing, social media audits, and page optimization tips.', 'facebook marketing blog, social media tips, page optimization, audit guide', 'Stay up to date with the latest insights on Facebook Page optimization, social media marketing strategies, and audit best practices from the Pagelyzer team.');

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT DEFAULT 'Pagelyzer Team',
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published blogs" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage blogs" ON public.blog_posts FOR ALL USING (public.is_admin_or_above(auth.uid()));

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
