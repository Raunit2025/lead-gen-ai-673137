/**
 * SUPABASE CLIENT - DUMMY IMPLEMENTATION
 * 
 * Direct Supabase usage from frontend is discouraged. 
 * This file exists to prevent build/runtime errors if any imports remain.
 * All data operations should go through the backend service layer.
 */

console.warn("Direct Supabase usage is deprecated. Please use the backend service layer instead.")

export const supabase = new Proxy({} as any, {
  get: (_, prop) => {
    if (prop === 'auth') {
      return {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: {}, error: new Error("Supabase is disabled on frontend") }),
        signUp: async () => ({ data: {}, error: new Error("Supabase is disabled on frontend") }),
        signOut: async () => ({ error: null }),
      };
    }
    return () => {
      console.error(`Supabase method "${String(prop)}" called, but Supabase is disabled on frontend.`);
      return { data: null, error: new Error("Supabase is disabled on frontend") };
    };
  }
});
