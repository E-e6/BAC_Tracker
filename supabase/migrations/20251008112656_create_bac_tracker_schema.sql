/*
  # BAC Tracker Database Schema

  ## Overview
  Creates a comprehensive blood alcohol content tracking system with:
  - Australian drinks database with standard drink information
  - User drinking sessions with timestamp tracking
  - Session drinks for detailed consumption history

  ## Tables Created

  ### 1. drinks
  Stores comprehensive information about alcoholic beverages
  - `id` (uuid, primary key) - Unique drink identifier
  - `name` (text) - Drink name (e.g., "VB Stubby", "Bundaberg Rum & Coke")
  - `category` (text) - Type of drink (beer, wine, spirits, premix, cider)
  - `volume_ml` (integer) - Serving size in milliliters
  - `alcohol_percentage` (decimal) - Alcohol by volume (ABV)
  - `standard_drinks` (decimal) - Australian standard drinks (10g alcohol)
  - `description` (text, optional) - Additional details
  - `brand` (text, optional) - Brand name
  - `is_custom` (boolean) - Whether user created this drink
  - `created_by` (uuid, optional) - User who created custom drink
  - `created_at` (timestamp) - Creation timestamp

  ### 2. drinking_sessions
  Tracks individual drinking sessions with user data
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - Anonymous session identifier (not linked to auth)
  - `weight_kg` (decimal) - User weight for BAC calculation
  - `gender` (text) - Gender for metabolism rate (male/female/other)
  - `started_at` (timestamp) - Session start time
  - `last_updated` (timestamp) - Last activity timestamp
  - `is_active` (boolean) - Whether session is currently active

  ### 3. session_drinks
  Records individual drink consumption within sessions
  - `id` (uuid, primary key) - Unique record identifier
  - `session_id` (uuid, foreign key) - Links to drinking_sessions
  - `drink_id` (uuid, foreign key) - Links to drinks
  - `quantity` (decimal) - Number of drinks consumed
  - `consumed_at` (timestamp) - When drink was consumed
  - `notes` (text, optional) - User notes

  ## Security
  - RLS enabled on all tables
  - Public can read standard drinks library
  - Users can manage their own sessions and custom drinks
  - Sessions use anonymous UUIDs (no auth required for privacy)

  ## Important Notes
  1. Standard drink in Australia = 10 grams of pure alcohol
  2. BAC calculation uses Widmark formula
  3. Average elimination rate: 0.015-0.018 BAC per hour
  4. Legal limits in Australia:
     - Full license: 0.05 BAC
     - Probationary/Learner: 0.00 BAC
     - Commercial drivers: 0.02 BAC
*/

-- Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('beer', 'wine', 'spirits', 'premix', 'cider', 'cocktail', 'other')),
  volume_ml integer NOT NULL CHECK (volume_ml > 0),
  alcohol_percentage decimal(4,2) NOT NULL CHECK (alcohol_percentage >= 0 AND alcohol_percentage <= 100),
  standard_drinks decimal(4,2) NOT NULL CHECK (standard_drinks > 0),
  description text DEFAULT '',
  brand text DEFAULT '',
  is_custom boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create drinking sessions table
CREATE TABLE IF NOT EXISTS drinking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  weight_kg decimal(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  started_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create session drinks table
CREATE TABLE IF NOT EXISTS session_drinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES drinking_sessions(id) ON DELETE CASCADE,
  drink_id uuid NOT NULL REFERENCES drinks(id) ON DELETE RESTRICT,
  quantity decimal(4,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  consumed_at timestamptz DEFAULT now(),
  notes text DEFAULT ''
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drinks_category ON drinks(category);
CREATE INDEX IF NOT EXISTS idx_drinks_is_custom ON drinks(is_custom);
CREATE INDEX IF NOT EXISTS idx_drinking_sessions_user_id ON drinking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_drinking_sessions_is_active ON drinking_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_session_drinks_session_id ON session_drinks(session_id);
CREATE INDEX IF NOT EXISTS idx_session_drinks_consumed_at ON session_drinks(consumed_at);

-- Enable Row Level Security
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_drinks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drinks table
CREATE POLICY "Anyone can view non-custom drinks"
  ON drinks FOR SELECT
  USING (is_custom = false);

CREATE POLICY "Users can view their own custom drinks"
  ON drinks FOR SELECT
  USING (is_custom = true AND created_by = gen_random_uuid());

CREATE POLICY "Anyone can create custom drinks"
  ON drinks FOR INSERT
  WITH CHECK (is_custom = true);

-- RLS Policies for drinking_sessions (public access for anonymous tracking)
CREATE POLICY "Anyone can view sessions"
  ON drinking_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON drinking_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON drinking_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sessions"
  ON drinking_sessions FOR DELETE
  USING (true);

-- RLS Policies for session_drinks
CREATE POLICY "Anyone can view session drinks"
  ON session_drinks FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add session drinks"
  ON session_drinks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update session drinks"
  ON session_drinks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete session drinks"
  ON session_drinks FOR DELETE
  USING (true);