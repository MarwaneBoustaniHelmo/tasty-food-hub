-- ============================================================================
-- Enhanced Row Level Security (RLS) for game_scores table
-- Migration: 20260129_add_rls_policies.sql
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view game scores" ON game_scores;
DROP POLICY IF EXISTS "Anyone can submit scores" ON game_scores;
DROP POLICY IF EXISTS "Public read access" ON game_scores;
DROP POLICY IF EXISTS "Validated score submission" ON game_scores;
DROP POLICY IF EXISTS "No updates allowed" ON game_scores;
DROP POLICY IF EXISTS "No deletes allowed" ON game_scores;

-- Ensure RLS is enabled
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICY 1: Public Read Access (Leaderboards)
-- ============================================================================

CREATE POLICY "Public read access"
  ON game_scores
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access" ON game_scores IS 
  'Anyone can view game scores for public leaderboards';

-- ============================================================================
-- POLICY 2: Validated Score Submission
-- ============================================================================

CREATE POLICY "Validated score submission"
  ON game_scores
  FOR INSERT
  WITH CHECK (
    -- Must have valid score range (0-10,000 points)
    score >= 0 
    AND score <= 10000
    
    -- Must be for current month only (prevent backdating)
    AND month_key = to_char(NOW(), 'YYYY-MM')
    
    -- Nickname validation (if provided)
    AND (
      nickname IS NULL 
      OR (
        length(nickname) >= 1 
        AND length(nickname) <= 50
        AND nickname ~ '^[a-zA-Z0-9 \-_]+$' -- Alphanumeric + spaces, hyphens, underscores
      )
    )
    
    -- Prevent future timestamps (clock tampering detection)
    AND created_at <= NOW() + interval '1 minute'
    
    -- Prevent backdating (must be recent submission)
    AND created_at >= NOW() - interval '10 minutes'
  );

COMMENT ON POLICY "Validated score submission" ON game_scores IS 
  'Enforce strict validation rules on score submissions to prevent cheating';

-- ============================================================================
-- POLICY 3: No Updates (Scores are Immutable)
-- ============================================================================

CREATE POLICY "No updates allowed"
  ON game_scores
  FOR UPDATE
  USING (false);

COMMENT ON POLICY "No updates allowed" ON game_scores IS 
  'Scores cannot be modified once submitted - prevents retroactive tampering';

-- ============================================================================
-- POLICY 4: No Deletes (Preserve History)
-- ============================================================================

CREATE POLICY "No deletes allowed"
  ON game_scores
  FOR DELETE
  USING (false);

COMMENT ON POLICY "No deletes allowed" ON game_scores IS 
  'Scores cannot be deleted - maintains leaderboard integrity';

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Index for leaderboard queries (month + score DESC)
CREATE INDEX IF NOT EXISTS idx_game_scores_month_score_desc
  ON game_scores(month_key, score DESC, created_at DESC);

-- Index for session-based rate limiting
CREATE INDEX IF NOT EXISTS idx_game_scores_session_time
  ON game_scores(session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

-- Index for daily/weekly analysis
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at
  ON game_scores(created_at DESC);

-- Partial index for top scores (performance optimization)
CREATE INDEX IF NOT EXISTS idx_game_scores_top_scores
  ON game_scores(score DESC, created_at DESC)
  WHERE score >= 1000;

-- ============================================================================
-- VIEW: Public Leaderboard (Top 100 per month)
-- ============================================================================

CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  rank() OVER (PARTITION BY month_key ORDER BY score DESC, created_at ASC) as rank,
  nickname,
  score,
  month_key,
  created_at,
  -- Hide session_id for privacy
  NULL as session_id
FROM game_scores
WHERE nickname IS NOT NULL
  AND score > 0
  AND score <= 10000 -- Exclude impossible scores
ORDER BY month_key DESC, score DESC
LIMIT 100;

-- Grant public access to view
GRANT SELECT ON public_leaderboard TO anon, authenticated;

COMMENT ON VIEW public_leaderboard IS 
  'Public leaderboard showing top 100 scores per month with privacy protection';

-- ============================================================================
-- VIEW: Monthly Statistics (Aggregate Data)
-- ============================================================================

CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  month_key,
  COUNT(*) as total_submissions,
  AVG(score) as avg_score,
  MAX(score) as max_score,
  MIN(score) as min_score,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) as median_score,
  COUNT(DISTINCT session_id) as unique_players,
  COUNT(*) FILTER (WHERE score >= 1000) as high_scores
FROM game_scores
GROUP BY month_key
ORDER BY month_key DESC;

GRANT SELECT ON monthly_stats TO anon, authenticated;

COMMENT ON VIEW monthly_stats IS 
  'Monthly game statistics for analytics dashboard';

-- ============================================================================
-- FUNCTION: Check for Suspicious Activity
-- ============================================================================

CREATE OR REPLACE FUNCTION check_suspicious_scores()
RETURNS TABLE (
  session_id TEXT,
  submission_count BIGINT,
  avg_score NUMERIC,
  max_score INTEGER,
  is_suspicious BOOLEAN,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.session_id,
    COUNT(*) as submission_count,
    AVG(gs.score) as avg_score,
    MAX(gs.score) as max_score,
    CASE
      WHEN COUNT(*) > 50 THEN true -- Too many submissions
      WHEN AVG(gs.score) > 8000 THEN true -- Unrealistic average
      WHEN MAX(gs.score) > 9000 THEN true -- Impossible max score
      ELSE false
    END as is_suspicious,
    CASE
      WHEN COUNT(*) > 50 THEN 'Excessive submissions'
      WHEN AVG(gs.score) > 8000 THEN 'Unrealistic average score'
      WHEN MAX(gs.score) > 9000 THEN 'Impossible maximum score'
      ELSE 'Normal activity'
    END as reason
  FROM game_scores gs
  WHERE gs.session_id IS NOT NULL
    AND gs.created_at >= NOW() - interval '24 hours'
  GROUP BY gs.session_id
  HAVING COUNT(*) > 10 OR MAX(gs.score) > 5000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_suspicious_scores() TO anon, authenticated;

COMMENT ON FUNCTION check_suspicious_scores() IS 
  'Detect suspicious scoring patterns for anti-cheat monitoring';

-- ============================================================================
-- TRIGGER: Validate Score on Insert (Additional Server-Side Check)
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_score_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Additional validation beyond RLS policies
  
  -- Check for SQL injection attempts in nickname
  IF NEW.nickname IS NOT NULL THEN
    IF NEW.nickname ~ '(--|;|\/\*|\*\/|xp_|sp_|exec|execute|script)' THEN
      RAISE EXCEPTION 'Invalid nickname format';
    END IF;
  END IF;
  
  -- Check for impossible score progression (optional - requires previous scores)
  -- IF NEW.score > 5000 AND NEW.session_id IS NOT NULL THEN
  --   -- Check if this user had recent low scores (sudden jump is suspicious)
  --   -- Implementation depends on your game mechanics
  -- END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_score
  BEFORE INSERT ON game_scores
  FOR EACH ROW
  EXECUTE FUNCTION validate_score_insert();

COMMENT ON TRIGGER trg_validate_score ON game_scores IS 
  'Additional server-side validation for score submissions';

-- ============================================================================
-- Success Message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Enhanced RLS policies and anti-cheat measures applied successfully!';
  RAISE NOTICE '📊 Views created: public_leaderboard, monthly_stats';
  RAISE NOTICE '🛡️ Policies active: read (public), insert (validated), no update/delete';
  RAISE NOTICE '🔍 Anti-cheat function: check_suspicious_scores()';
END $$;
