import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async (auditId: string) => {
    setIsExporting(true);
    try {
      // Call edge function to get HTML
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { audit_id: auditId },
      });

      if (error || !data?.html) {
        throw new Error(error?.message || 'Failed to generate report');
      }

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      // Create temp container
      const container = document.createElement('div');
      container.innerHTML = data.html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Generate PDF
      await html2pdf()
        .set({
          margin: 10,
          filename: `${data.audit?.page_name || 'audit'}-report.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
      toast.success('PDF downloaded successfully!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export PDF';
      toast.error(message);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting };
}
