
-- Add INSERT policy for pipelines table so users can create demo data
CREATE POLICY "Users can insert pipelines for their associations" 
  ON public.pipelines 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_pipelines 
      WHERE pipeline_id = pipelines.id 
      AND user_id = auth.uid()
    )
  );
