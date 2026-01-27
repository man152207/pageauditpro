import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Edit,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_type: 'free' | 'one_time' | 'monthly' | 'yearly';
  feature_flags: Record<string, boolean>;
  limits: Record<string, number>;
  is_active: boolean;
  sort_order: number;
}

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  currency: string;
  billing_type: 'free' | 'one_time' | 'monthly' | 'yearly';
  feature_flags: Record<string, boolean>;
  limits: Record<string, string>;
  is_active: boolean;
  sort_order: string;
}

const defaultFeatureFlags = {
  manual_audit: true,
  pro_audit: false,
  pdf_export: false,
  share_report: false,
  history: false,
  white_label: false,
  team: false,
};

const defaultLimits = {
  audits_per_month: '5',
  pdf_exports: '0',
  history_days: '0',
  team_members: '1',
};

const emptyFormData: PlanFormData = {
  name: '',
  description: '',
  price: '0',
  currency: 'USD',
  billing_type: 'free',
  feature_flags: defaultFeatureFlags,
  limits: defaultLimits,
  is_active: true,
  sort_order: '0',
};

export default function PlansManagementPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(emptyFormData);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      
      setPlans(data?.map(p => ({
        ...p,
        feature_flags: p.feature_flags as Record<string, boolean>,
        limits: p.limits as Record<string, number>,
      })) || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      currency: plan.currency,
      billing_type: plan.billing_type,
      feature_flags: { ...defaultFeatureFlags, ...plan.feature_flags },
      limits: {
        audits_per_month: (plan.limits.audits_per_month || 0).toString(),
        pdf_exports: (plan.limits.pdf_exports || 0).toString(),
        history_days: (plan.limits.history_days || 0).toString(),
        team_members: (plan.limits.team_members || 1).toString(),
      },
      is_active: plan.is_active,
      sort_order: plan.sort_order.toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Plan name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        billing_type: formData.billing_type,
        feature_flags: formData.feature_flags,
        limits: {
          audits_per_month: parseInt(formData.limits.audits_per_month) || 0,
          pdf_exports: parseInt(formData.limits.pdf_exports) || 0,
          history_days: parseInt(formData.limits.history_days) || 0,
          team_members: parseInt(formData.limits.team_members) || 1,
        },
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Plan updated successfully' });
      } else {
        const { error } = await supabase
          .from('plans')
          .insert(planData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Plan created successfully' });
      }

      setDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Plan deleted successfully' });
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      fetchPlans();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update plan status',
        variant: 'destructive',
      });
    }
  };

  const updateFormField = (field: keyof PlanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateFeatureFlag = (flag: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      feature_flags: { ...prev.feature_flags, [flag]: value },
    }));
  };

  const updateLimit = (limit: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      limits: { ...prev.limits, [limit]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans & Pricing</h1>
          <p className="text-muted-foreground">
            Manage subscription plans, features, and limits.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </DialogTitle>
              <DialogDescription>
                Configure plan details, features, and usage limits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    placeholder="Pro Monthly"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_type">Billing Type</Label>
                  <Select
                    value={formData.billing_type}
                    onValueChange={(v) => updateFormField('billing_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="one_time">One-Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  placeholder="Plan description..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateFormField('price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => updateFormField('currency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="NPR">NPR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => updateFormField('sort_order', e.target.value)}
                  />
                </div>
              </div>

              {/* Feature Flags */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Feature Flags</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(formData.feature_flags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <Label htmlFor={key} className="font-normal capitalize">
                        {key.replace(/_/g, ' ')}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(v) => updateFeatureFlag(key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Limits */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Usage Limits</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="audits_per_month">Audits per Month</Label>
                    <Input
                      id="audits_per_month"
                      type="number"
                      value={formData.limits.audits_per_month}
                      onChange={(e) => updateLimit('audits_per_month', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdf_exports">PDF Exports per Month</Label>
                    <Input
                      id="pdf_exports"
                      type="number"
                      value={formData.limits.pdf_exports}
                      onChange={(e) => updateLimit('pdf_exports', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="history_days">History Days</Label>
                    <Input
                      id="history_days"
                      type="number"
                      value={formData.limits.history_days}
                      onChange={(e) => updateLimit('history_days', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_members">Team Members</Label>
                    <Input
                      id="team_members"
                      type="number"
                      value={formData.limits.team_members}
                      onChange={(e) => updateLimit('team_members', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <Label htmlFor="is_active" className="font-medium">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive plans won't be shown to users
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(v) => updateFormField('is_active', v)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {plan.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">
                    {plan.currency} {plan.price}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {plan.billing_type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(plan.feature_flags || {})
                      .filter(([_, v]) => v)
                      .slice(0, 3)
                      .map(([k]) => (
                        <Badge key={k} variant="secondary" className="text-xs">
                          {k.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    {Object.values(plan.feature_flags || {}).filter(Boolean).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{Object.values(plan.feature_flags || {}).filter(Boolean).length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={() => toggleActive(plan)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(plan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
