import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://eckmchgpoiemyczwniqx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-LsO8SHB3vRScDU5a3zBsA_qFheEzLG';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && !rawUrl.includes('placeholder')) ? rawUrl : DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (rawKey && !rawKey.includes('placeholder')) ? rawKey : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
