
-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert pipelines for their associations" ON public.pipelines;

-- Create a simpler policy that allows authenticated users to insert pipelines
CREATE POLICY "Authenticated users can insert pipelines" 
  ON public.pipelines 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
