import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';



if (!isMockMode && (!supabaseUrl || !supabaseAnonKey)) {

  console.warn(

    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are not configured. ' +

    'Application will crash if not in mock mode.'

  );

}



export const supabase = (supabaseUrl && supabaseAnonKey) 

  ? createClient(supabaseUrl, supabaseAnonKey) 

  : (null as any);
