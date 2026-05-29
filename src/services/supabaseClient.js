import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase Client
 * Centraliza a conexão com o backend para autenticação e banco de dados.
 * Nota: Certifique-se de configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu .env.
 */
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
