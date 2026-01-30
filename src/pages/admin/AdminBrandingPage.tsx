import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Upload,
  Palette,
  Save,
  Loader2,
  Eye,
  Image,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminBrandingPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [companyName, setCompanyName] = useState('');

  // Fetch organization data
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (error) throw error;

      // Initialize form with org data
      if (data) {
        setCompanyName(data.name || '');
        setLogoPreview(data.logo_url || null);
        const branding = data.branding_settings as { primary_color?: string; secondary_color?: string } | null;
        if (branding) {
          setPrimaryColor(branding.primary_color || '#6366F1');
          setSecondaryColor(branding.secondary_color || '#8B5CF6');
        }
      }

      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile?.organization_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: companyName,
          branding_settings: {
            primary_color: primaryColor,
            secondary_color: secondaryColor,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.organization_id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast({
        title: 'Branding saved',
        description: 'Your branding settings have been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save branding',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile?.organization_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agency Branding"
          description="Customize your reports with your brand."
        />
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Organization</h3>
            <p className="text-muted-foreground">
              You need to be part of an organization to access branding settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Branding"
        description="Customize your reports with your brand identity."
        actions={
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Company Logo
            </CardTitle>
            <CardDescription>
              Upload your company logo to appear on reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or SVG. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Colors
            </CardTitle>
            <CardDescription>
              Set your brand colors for customized reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-3">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-16 p-1 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#6366F1"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-3">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-16 p-1 cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
            <CardDescription>
              See how your branding will appear on reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl p-8 text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain bg-white rounded-lg p-1" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{companyName || 'Your Company'}</h3>
                  <p className="opacity-80">Facebook Page Audit Report</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">85</p>
                  <p className="text-sm opacity-80">Overall Score</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm opacity-80">Pages Audited</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">+15%</p>
                  <p className="text-sm opacity-80">Improvement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
