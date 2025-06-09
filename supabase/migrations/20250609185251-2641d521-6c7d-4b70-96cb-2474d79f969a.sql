
-- First, let's drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view their pipeline associations" ON public.user_pipelines;
DROP POLICY IF EXISTS "Pipeline owners can manage associations" ON public.user_pipelines;

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_user_pipeline_role(pipeline_uuid UUID, user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_pipelines 
  WHERE pipeline_id = pipeline_uuid AND user_id = user_uuid
  LIMIT 1;
$$;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view their pipeline associations" 
  ON public.user_pipelines 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own pipeline associations" 
  ON public.user_pipelines 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pipeline owners can manage associations" 
  ON public.user_pipelines 
  FOR ALL 
  USING (
    user_id = auth.uid() OR 
    public.get_user_pipeline_role(pipeline_id, auth.uid()) = 'owner'
  );
