import { Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DataDeletionPage() {
  return (
    <div className="container max-w-3xl py-16 lg:py-24">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Data Deletion Instructions
          </h1>
          <p className="text-lg text-muted-foreground">
            Pagelyzer respects your privacy and your right to control your data.
          </p>
        </div>

        {/* Main Content */}
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              If you have used Facebook Login or any Pagelyzer services and would like to request deletion of your data, please follow the steps below:
            </p>

            {/* Steps */}
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-foreground">
                Send an email to:{' '}
                <a 
                  href="mailto:support@pagelyzer.io" 
                  className="text-primary hover:underline font-medium"
                >
                  support@pagelyzer.io
                </a>
              </li>
              <li className="text-foreground">
                Use the subject line:{' '}
                <span className="font-medium">"Facebook Data Deletion Request"</span>
              </li>
              <li className="text-foreground">
                Include your Facebook User ID and the email address associated with your Pagelyzer account.
              </li>
            </ol>

            {/* Timeframe Notice */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upon receiving your request, we will verify the information and permanently delete your associated data from our systems within <strong className="text-foreground">7 working days</strong>.
              </p>
            </div>

            {/* Contact Section */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-muted-foreground">
                If you have any questions regarding data privacy or deletion, please contact us at{' '}
                <a 
                  href="mailto:support@pagelyzer.io" 
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  support@pagelyzer.io
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data We Collect Notice */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Pagelyzer may receive limited data via Facebook Login including your name, profile picture, and email address (if provided).
          </p>
        </div>
      </div>
    </div>
  );
}
