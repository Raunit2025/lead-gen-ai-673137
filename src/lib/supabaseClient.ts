import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are missing! Check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Falling back to local storage.")
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: (_, prop) => {
        if (prop === 'auth') {
           return new Proxy({}, {
             get: (_, authProp) => {
               return () => {
                 throw new Error("Supabase client not initialized: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.")
               }
             }
           })
        }
        return () => {
          throw new Error("Supabase client not initialized: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.")
        }
      }
    })