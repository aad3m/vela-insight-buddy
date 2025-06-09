
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const demoRepositories = [
  'target/mobile-app',
  'target/payment-service',
  'target/inventory-api',
  'target/web-frontend',
  'target/notification-service',
  'target/user-management',
  'target/analytics-platform',
  'target/search-service'
];

const demoBranches = ['main', 'develop', 'feature/checkout-v2', 'hotfix/payment-bug', 'feature/mobile-redesign'];
const demoAuthors = ['sarah.chen', 'mike.rodriguez', 'alex.kim', 'emma.wilson', 'david.park', 'lisa.johnson'];
const demoSteps = ['Clone Repository', 'Install Dependencies', 'Run Tests', 'Build Application', 'Deploy to Staging', 'Integration Tests', 'Deploy to Production'];

const generateRandomCommitHash = () => {
  return Math.random().toString(36).substring(2, 9);
};

const generateRandomDuration = () => {
  const minutes = Math.floor(Math.random() * 20) + 2;
  const seconds = Math.floor(Math.random() * 60);
  return `${minutes}m ${seconds}s`;
};

export const useDemoData = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createDemoPipelines = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create demo data.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Clear existing pipelines first
      await supabase.from('pipelines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('user_pipelines').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const pipelines = [];
      const userPipelineAssociations = [];

      // Generate 15 demo pipelines with various statuses
      for (let i = 0; i < 15; i++) {
        const status = i < 8 ? 'success' : i < 11 ? 'running' : i < 13 ? 'failed' : 'pending';
        const progress = status === 'running' ? Math.floor(Math.random() * 80) + 10 : 
                        status === 'success' ? 100 : 
                        status === 'failed' ? Math.floor(Math.random() * 70) + 20 : 0;

        const pipeline = {
          repo_name: demoRepositories[Math.floor(Math.random() * demoRepositories.length)],
          branch: demoBranches[Math.floor(Math.random() * demoBranches.length)],
          status,
          progress: status === 'pending' ? null : progress,
          duration: status === 'running' || status === 'pending' ? null : generateRandomDuration(),
          author: demoAuthors[Math.floor(Math.random() * demoAuthors.length)],
          commit_hash: generateRandomCommitHash(),
          current_step: status === 'running' ? demoSteps[Math.floor(Math.random() * demoSteps.length)] : null,
          vela_build_id: `build_${Date.now()}_${i}`,
          created_at: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(), // Last 2 days
          updated_at: new Date(Date.now() - Math.random() * 3600000).toISOString() // Last hour
        };

        pipelines.push(pipeline);
      }

      // Insert pipelines
      const { data: insertedPipelines, error: pipelineError } = await supabase
        .from('pipelines')
        .insert(pipelines)
        .select('id');

      if (pipelineError) {
        throw pipelineError;
      }

      // Associate all pipelines with the current user
      if (insertedPipelines) {
        for (const pipeline of insertedPipelines) {
          userPipelineAssociations.push({
            user_id: user.id,
            pipeline_id: pipeline.id,
            role: 'member'
          });
        }

        const { error: associationError } = await supabase
          .from('user_pipelines')
          .insert(userPipelineAssociations);

        if (associationError) {
          throw associationError;
        }
      }

      toast({
        title: "Demo Data Created",
        description: `Successfully created ${pipelines.length} demo pipelines across various Target repositories.`,
      });

    } catch (error) {
      console.error('Error creating demo data:', error);
      toast({
        title: "Error Creating Demo Data",
        description: error.message || "Failed to create demo pipelines.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { createDemoPipelines, loading };
};
