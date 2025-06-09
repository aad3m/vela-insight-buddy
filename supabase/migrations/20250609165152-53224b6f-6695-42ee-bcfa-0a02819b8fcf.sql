
-- Create pipelines table to store pipeline information
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'pending')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  duration TEXT,
  author TEXT,
  commit_hash TEXT,
  current_step TEXT,
  vela_build_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_pipelines junction table to associate users with pipelines
CREATE TABLE public.user_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  pipeline_id UUID REFERENCES public.pipelines NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'contributor', 'member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pipeline_id)
);

-- Enable RLS on both tables
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pipelines ENABLE ROW LEVEL SECURITY;

-- Create policies for pipelines - users can only see pipelines they're associated with
CREATE POLICY "Users can view their associated pipelines" 
  ON public.pipelines 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_pipelines 
      WHERE pipeline_id = pipelines.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their associated pipelines" 
  ON public.pipelines 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_pipelines 
      WHERE pipeline_id = pipelines.id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'contributor')
    )
  );

-- Create policies for user_pipelines
CREATE POLICY "Users can view their pipeline associations" 
  ON public.user_pipelines 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Pipeline owners can manage associations" 
  ON public.user_pipelines 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_pipelines existing
      WHERE existing.pipeline_id = user_pipelines.pipeline_id 
      AND existing.user_id = auth.uid()
      AND existing.role = 'owner'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_pipelines_status ON public.pipelines(status);
CREATE INDEX idx_pipelines_updated_at ON public.pipelines(updated_at);
CREATE INDEX idx_user_pipelines_user_id ON public.user_pipelines(user_id);
CREATE INDEX idx_user_pipelines_pipeline_id ON public.user_pipelines(pipeline_id);
