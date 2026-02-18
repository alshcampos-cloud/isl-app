-- ============================================================
-- Phase 2B: Onboarding Funnel Analytics Queries
-- Run in Supabase SQL Editor after 1+ week of live traffic
-- ============================================================

-- 1. FUNNEL CONVERSION RATE BY SCREEN
-- What % of people who start reach each screen?
SELECT
  screen_number,
  screen_name,
  COUNT(DISTINCT session_id) AS sessions,
  ROUND(
    COUNT(DISTINCT session_id) * 100.0 /
    NULLIF((SELECT COUNT(DISTINCT session_id) FROM onboarding_events WHERE screen_number = 1 AND action = 'viewed'), 0),
    1
  ) AS pct_of_starters
FROM onboarding_events
WHERE action = 'viewed'
GROUP BY screen_number, screen_name
ORDER BY screen_number;


-- 2. BREATHING EXERCISE: SKIP vs START vs COMPLETE
-- How many users engage with the breathing exercise?
SELECT
  action,
  COUNT(*) AS count,
  ROUND(
    COUNT(*) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM onboarding_events WHERE screen_number = 2 AND action = 'viewed'), 0),
    1
  ) AS pct_of_viewers
FROM onboarding_events
WHERE screen_number = 2 AND action IN ('started', 'completed', 'skipped')
GROUP BY action
ORDER BY count DESC;


-- 3. AVERAGE AND MEDIAN TIME SPENT PER SCREEN
-- How long are users spending on each screen?
SELECT
  screen_number,
  screen_name,
  COUNT(*) AS samples,
  ROUND(AVG(time_on_screen_ms) / 1000.0, 1) AS avg_seconds,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_on_screen_ms) / 1000.0, 1) AS median_seconds,
  ROUND(MIN(time_on_screen_ms) / 1000.0, 1) AS min_seconds,
  ROUND(MAX(time_on_screen_ms) / 1000.0, 1) AS max_seconds
FROM onboarding_events
WHERE action = 'time_on_screen' AND time_on_screen_ms IS NOT NULL
GROUP BY screen_number, screen_name
ORDER BY screen_number;


-- 4. ARCHETYPE DISTRIBUTION
-- Which archetype is most common?
SELECT
  metadata->>'archetype' AS archetype,
  COUNT(*) AS count,
  ROUND(
    COUNT(*) * 100.0 /
    NULLIF(SUM(COUNT(*)) OVER (), 0),
    1
  ) AS pct
FROM onboarding_events
WHERE screen_number = 1 AND action = 'completed' AND metadata->>'archetype' IS NOT NULL
GROUP BY metadata->>'archetype'
ORDER BY count DESC;


-- 5. PRACTICE SCORE DISTRIBUTION
-- What scores do onboarding users get?
SELECT
  (metadata->>'score')::int AS score,
  COUNT(*) AS count
FROM onboarding_events
WHERE screen_number = 3 AND action = 'feedback_received' AND metadata->>'score' IS NOT NULL
GROUP BY (metadata->>'score')::int
ORDER BY score;

-- Score stats
SELECT
  COUNT(*) AS total_submissions,
  ROUND(AVG((metadata->>'score')::numeric), 1) AS avg_score,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (metadata->>'score')::numeric), 1) AS median_score
FROM onboarding_events
WHERE screen_number = 3 AND action = 'feedback_received' AND metadata->>'score' IS NOT NULL;


-- 6. DROP-OFF POINT
-- Which screen loses the most people?
WITH screen_counts AS (
  SELECT
    screen_number,
    screen_name,
    COUNT(DISTINCT session_id) AS sessions
  FROM onboarding_events
  WHERE action = 'viewed'
  GROUP BY screen_number, screen_name
)
SELECT
  sc.screen_number,
  sc.screen_name,
  sc.sessions,
  LAG(sc.sessions) OVER (ORDER BY sc.screen_number) AS prev_screen_sessions,
  sc.sessions - LAG(sc.sessions) OVER (ORDER BY sc.screen_number) AS dropoff,
  ROUND(
    (LAG(sc.sessions) OVER (ORDER BY sc.screen_number) - sc.sessions) * 100.0 /
    NULLIF(LAG(sc.sessions) OVER (ORDER BY sc.screen_number), 0),
    1
  ) AS dropoff_pct
FROM screen_counts sc
ORDER BY sc.screen_number;


-- 7. FULL FUNNEL VISUALIZATION
-- Cumulative % from start to finish
WITH funnel AS (
  SELECT
    screen_number,
    screen_name,
    COUNT(DISTINCT session_id) AS sessions
  FROM onboarding_events
  WHERE action = 'viewed'
  GROUP BY screen_number, screen_name
)
SELECT
  screen_number,
  screen_name,
  sessions,
  ROUND(
    sessions * 100.0 /
    NULLIF(FIRST_VALUE(sessions) OVER (ORDER BY screen_number), 0),
    1
  ) AS cumulative_pct,
  REPEAT('█', (sessions * 50 / NULLIF(FIRST_VALUE(sessions) OVER (ORDER BY screen_number), 0))::int) AS bar
FROM funnel
ORDER BY screen_number;


-- 8. SIGNUP CONVERSION (bonus)
-- Of people who reach screen 5, how many complete signup?
SELECT
  action,
  COUNT(DISTINCT session_id) AS sessions
FROM onboarding_events
WHERE screen_number = 5 AND action IN ('viewed', 'form_started', 'signup_completed', 'signup_error', 'signin_clicked')
GROUP BY action
ORDER BY
  CASE action
    WHEN 'viewed' THEN 1
    WHEN 'form_started' THEN 2
    WHEN 'signup_completed' THEN 3
    WHEN 'signup_error' THEN 4
    WHEN 'signin_clicked' THEN 5
  END;


-- 9. TIMELINE AND FIELD SELECTIONS (bonus)
-- What are users selecting on screen 1?
SELECT
  metadata->>'timeline' AS timeline,
  COUNT(*) AS count
FROM onboarding_events
WHERE screen_number = 1 AND action = 'timeline_selected' AND metadata->>'timeline' IS NOT NULL
GROUP BY metadata->>'timeline'
ORDER BY count DESC;

SELECT
  metadata->>'field' AS field,
  COUNT(*) AS count
FROM onboarding_events
WHERE screen_number = 1 AND action = 'field_selected' AND metadata->>'field' IS NOT NULL
GROUP BY metadata->>'field'
ORDER BY count DESC;


-- 10. DAILY ONBOARDING STARTS (bonus)
-- Trend over time
SELECT
  DATE(created_at) AS day,
  COUNT(DISTINCT session_id) AS new_onboarding_sessions,
  COUNT(DISTINCT CASE WHEN screen_number = 5 AND action = 'signup_completed' THEN session_id END) AS signups
FROM onboarding_events
GROUP BY DATE(created_at)
ORDER BY day DESC
LIMIT 30;
