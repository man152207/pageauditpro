import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SeedResult = {
  users: Array<{ email: string; user_id: string; role: "super_admin" | "admin" | "user" }>;
  password: string;
};

export function useSeedTestUsers() {
  return useMutation({
    mutationFn: async (): Promise<SeedResult> => {
      const { data, error } = await supabase.functions.invoke("seed-test-users", {
        body: {},
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as SeedResult;
    },
  });
}
