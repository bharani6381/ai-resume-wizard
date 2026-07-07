
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX resumes_user_id_idx ON public.resumes(user_id);
