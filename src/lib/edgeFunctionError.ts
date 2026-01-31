type MaybeIntegrationError = {
  error?: {
    human_message?: string;
    fix_steps?: string[];
  };
};

/**
 * Supabase Functions invoke returns a generic "Edge Function returned a non-2xx status code".
 * This helper tries to extract the real JSON body to show a useful message to the user.
 */
export function getEdgeFunctionHumanMessage(
  fnError: unknown,
  data: unknown,
  fallback: string
): string {
  const dataAny = data as MaybeIntegrationError | null;
  const fromData = dataAny?.error?.human_message;
  if (fromData) return fromData;

  const errAny = fnError as any;
  const generic = typeof errAny?.message === "string" ? errAny.message : undefined;

  // supabase-js FunctionsError often includes: { context: { body } }
  const body = errAny?.context?.body;
  if (typeof body === "string" && body.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(body) as MaybeIntegrationError;
      const msg = parsed?.error?.human_message;
      if (msg) return msg;
    } catch {
      // ignore
    }
  }

  return generic || fallback;
}
