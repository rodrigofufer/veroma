import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carga las variables de entorno en Node.js
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key] || '';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// --- INICIO DE CAMBIO PARA DEPURACIÓN ---
// Vamos a imprimir las variables en la consola para asegurarnos de que se están cargando.
console.log("Supabase URL Cargada:", supabaseUrl);
console.log("Supabase Anon Key Cargada:", supabaseAnonKey ? "Sí, la clave está presente." : "No, la clave está FALTANDO.");
// --- FIN DE CAMBIO PARA DEPURACIÓN ---

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

const createMockClient = () => {
  // ... (el resto de la función se mantiene igual)
  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: { message: 'Supabase not configured' } }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } })
  };
  const mockFrom = () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) })
  });
  const mockRpc = () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
  return { auth: mockAuth, from: mockFrom, rpc: mockRpc };
};

export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      `Missing Supabase environment variables. Using mock client.`
    );
    return createMockClient();
  }
  return createClient(supabaseUrl, supabaseAnonKey, { /* ... el resto de la configuración ... */ });
})();

// (El resto del archivo se mantiene igual)
export const getEmailSettings = () => { /* ... */ };
export const handleAuthError = (error: any) => { /* ... */ };
export const recoverSession = async () => { /* ... */ };
export const fetchPublicStats = async () => { /* ... */ };
export const checkUserProfileExists = async (userId: string): Promise<boolean> => { /* ... */ };
export const createProfileIfNeeded = async (userId: string, userData: any): Promise<boolean> => { /* ... */ };