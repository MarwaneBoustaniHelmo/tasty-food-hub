-- Migration: Create game_scores table for arcade game leaderboards
-- Created: 2026-01-29

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create game_scores table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  month_key TEXT NOT NULL,
  session_id TEXT,
  
  -- Constraints to prevent abuse
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 10000),
  CONSTRAINT valid_month_key CHECK (month_key ~ '^\d{4}-\d{2}$')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_scores_month_score 
  ON game_scores(month_key, score DESC);
  
CREATE INDEX IF NOT EXISTS idx_game_scores_created 
  ON game_scores(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read scores
CREATE POLICY "Anyone can view game scores"
  ON game_scores
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert scores (with validation)
CREATE POLICY "Anyone can submit scores"
  ON game_scores
  FOR INSERT
  WITH CHECK (
    score >= 0 
    AND score <= 10000
    AND month_key = to_char(NOW(), 'YYYY-MM')
  );

-- Comment for documentation
COMMENT ON TABLE game_scores IS 'Stores arcade game scores for monthly leaderboards and prize distribution';
COMMENT ON COLUMN game_scores.month_key IS 'Format: YYYY-MM for monthly leaderboard grouping';
COMMENT ON COLUMN game_scores.session_id IS 'Browser session identifier to prevent spam (optional)';
