import { createClient } from '@supabase/supabase-js';

// 1. URL limpia (sin el /rest/v1/ al final)
const supabaseUrl = 'https://qzesfdluxomapvspzpie.supabase.co'; 

// 2. Usamos SOLO la llave pública (publishable / anon)
const supabaseKey = 'sb_publishable_Eu3Q2-psxROqpHbJuVr-Ag_PRN_Ml2D';

export const supabase = createClient(supabaseUrl, supabaseKey);