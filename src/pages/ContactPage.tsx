import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="mb-3">Contact Us</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have questions about Pagelyzer? We're here to help. Reach out to our team 
            and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="premium-card space-y-3">
            <div className="feature-icon-primary">
              <Mail className="h-4 w-4" />
            </div>
            <h3>Email Support</h3>
            <p className="text-sm text-muted-foreground">
              For general inquiries, technical support, or partnership opportunities.
            </p>
            <a 
              href="mailto:support@pagelyzer.io" 
              className="inline-flex items-center text-primary hover:underline font-medium text-sm"
            >
              support@pagelyzer.io
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </a>
          </div>

          <div className="premium-card space-y-3">
            <div className="feature-icon-primary">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h3>Live Chat</h3>
            <p className="text-sm text-muted-foreground">
              Get instant help from our support team during business hours.
            </p>
            <Button variant="outline" size="sm">
              Start Chat
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
          <h3 className="mb-2">Looking for Quick Answers?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Check out our frequently asked questions for instant answers to common queries.
          </p>
          <Button asChild>
            <Link to="/faq">
              View FAQ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
