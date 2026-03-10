import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ktzykdkfwbyytumynapl.supabase.co"
const supabaseAnonKey = "sb_publishable_6jWenHnxx4KOik3F6gFY_g_3M6NvDwh"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
