import { AuditFlow } from '@/components/audit/AuditFlow';
import { PageHeader } from '@/components/ui/page-header';

export default function ManualAuditPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Run Page Audit"
        description="Connect your Facebook page to get personalized insights and recommendations."
        className="mb-8"
      />

      <div className="rounded-xl border border-border bg-card p-8">
        <AuditFlow />
      </div>
    </div>
  );
}
