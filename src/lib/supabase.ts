import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export interface Drink {
  id: string;
  name: string;
  category: 'beer' | 'wine' | 'spirits' | 'premix' | 'cider' | 'cocktail' | 'other';
  volume_ml: number;
  alcohol_percentage: number;
  standard_drinks: number;
  description: string;
  brand: string;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface DrinkingSession {
  id: string;
  user_id: string;
  weight_kg: number;
  gender: 'male' | 'female' | 'other';
  started_at: string;
  last_updated: string;
  is_active: boolean;
}

export interface SessionDrink {
  id: string;
  session_id: string;
  drink_id: string;
  quantity: number;
  consumed_at: string;
  notes: string;
  drink?: Drink;
}
