
# Fix: Audit Re-run Button + Verify Posts Fix

## Problem Summary
Two issues were found:

1. **The "Re-run" button on the report page does nothing** -- it has no `onClick` handler, so clicking it has zero effect. The user keeps viewing stale audit data that was generated before the Facebook API fix.

2. **All existing Watch Ghar audits contain the old deprecated `attachments` error** -- confirmed in the database: `posts_available: false`, `postsError: "(#12) deprecate_post_aggregated_fields_for_attachement is deprecated"`. The code fix removing `attachments` IS deployed, but no new audit has been triggered since.

## Root Cause
The Re-run button in `AuditReportPage.tsx` (line 315) is a plain `<Button>` with no click handler:
```tsx
<Button size="sm">
  <RefreshCw className="mr-2 h-4 w-4" />
  <span className="hidden sm:inline">Re-run</span>
</Button>
```

## Changes Required

### File: `src/pages/dashboard/AuditReportPage.tsx`

1. **Import `useRunAudit`** from `@/hooks/useAudits`
2. **Add re-run logic**: When clicked, call `runAudit.mutateAsync` using the audit's `fb_connection_id`, then navigate to the new audit's report page
3. **Add loading state** to the button while audit is running
4. **Handle missing connection**: If the audit has no `fb_connection_id` (e.g., manual audits), disable the button or show a tooltip

### Implementation Detail

```tsx
// Add to component
const runAudit = useRunAudit();
const [isRerunning, setIsRerunning] = useState(false);

const handleRerun = async () => {
  if (!report?.fb_connection_id) return;
  setIsRerunning(true);
  try {
    const result = await runAudit.mutateAsync({
      connectionId: report.fb_connection_id,
    });
    // Navigate to the new audit report
    navigate(`/dashboard/report/${result.audit_id}`);
  } catch (e) {
    // Error handled by the hook's onError
  } finally {
    setIsRerunning(false);
  }
};

// Update button
<Button size="sm" onClick={handleRerun} disabled={isRerunning || !report?.fb_connection_id}>
  {isRerunning ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <RefreshCw className="mr-2 h-4 w-4" />
  )}
  <span className="hidden sm:inline">{isRerunning ? 'Running...' : 'Re-run'}</span>
</Button>
```

## Summary

| Action | File | What |
|--------|------|------|
| Wire up Re-run button | `src/pages/dashboard/AuditReportPage.tsx` | Add onClick handler to trigger new audit and navigate to result |

After this fix, clicking "Re-run" will execute the updated edge function (which no longer requests the deprecated `attachments` field), and the new audit will contain real post data.
