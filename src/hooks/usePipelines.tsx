
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Pipeline {
  id: string;
  repo_name: string;
  branch: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  progress: number | null;
  duration: string | null;
  author: string | null;
  commit_hash: string | null;
  current_step: string | null;
  vela_build_id: string | null;
  created_at: string;
  updated_at: string;
}

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPipelines = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          id,
          repo_name,
          branch,
          status,
          progress,
          duration,
          author,
          commit_hash,
          current_step,
          vela_build_id,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching pipelines:', error);
        setError(error.message);
      } else {
        setPipelines(data || []);
      }
    } catch (err) {
      console.error('Error in fetchPipelines:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, [user]);

  return { pipelines, loading, error, refetch: fetchPipelines };
};
