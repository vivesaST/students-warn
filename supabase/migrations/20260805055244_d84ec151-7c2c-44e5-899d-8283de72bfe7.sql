ALTER TABLE public.risk_assessments
  ADD COLUMN IF NOT EXISTS fired_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS baseline_score integer NOT NULL DEFAULT 30;