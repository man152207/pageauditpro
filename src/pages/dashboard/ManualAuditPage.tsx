import { AuditFlow } from '@/components/audit/AuditFlow';
import { PageHeader } from '@/components/ui/page-header';

export default function ManualAuditPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Run Facebook Page Audit"
        description="Connect your Facebook page to analyze engagement, content performance, and get personalized recommendations."
        className="mb-8"
      />

      <div className="rounded-xl border border-border bg-card p-8">
        <AuditFlow />
      </div>
    </div>
  );
}
