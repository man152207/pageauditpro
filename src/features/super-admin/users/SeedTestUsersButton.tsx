import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSeedTestUsers } from "./useSeedTestUsers";
import { Loader2, UserPlus } from "lucide-react";

export function SeedTestUsersButton({ onSeeded }: { onSeeded?: () => void }) {
  const { toast } = useToast();
  const seed = useSeedTestUsers();

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        try {
          const result = await seed.mutateAsync();
          toast({
            title: "Test accounts ready",
            description: `Created/updated: ${result.users.map((u) => u.email).join(", ")}. Password: ${result.password}`,
          });
          onSeeded?.();
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Failed to create test accounts";
          toast({ title: "Error", description: message, variant: "destructive" });
        }
      }}
      disabled={seed.isPending}
    >
      {seed.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Create test accounts
        </>
      )}
    </Button>
  );
}
