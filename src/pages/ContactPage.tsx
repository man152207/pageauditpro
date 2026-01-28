import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about Pagelyzer? We're here to help. Reach out to our team 
            and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Email Support</h2>
            <p className="text-muted-foreground">
              For general inquiries, technical support, or partnership opportunities.
            </p>
            <a 
              href="mailto:support@pagelyzer.io" 
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              support@pagelyzer.io
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Live Chat</h2>
            <p className="text-muted-foreground">
              Get instant help from our support team during business hours.
            </p>
            <Button variant="outline" className="mt-2">
              Start Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for Quick Answers?</h2>
          <p className="text-muted-foreground mb-6">
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
