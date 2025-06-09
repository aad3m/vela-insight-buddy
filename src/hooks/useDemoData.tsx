
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Hardcoded demo data
export const DEMO_PIPELINES = [
  {
    id: 'demo-1',
    repo_name: 'target/mobile-app',
    branch: 'main',
    status: 'success' as const,
    progress: 100,
    duration: '8m 45s',
    author: 'sarah.chen',
    commit_hash: 'a1b2c3d',
    current_step: null,
    vela_build_id: 'build_demo_1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo-2',
    repo_name: 'target/payment-service',
    branch: 'feature/checkout-v2',
    status: 'running' as const,
    progress: 65,
    duration: null,
    author: 'mike.rodriguez',
    commit_hash: 'b2c3d4e',
    current_step: 'Running Tests',
    vela_build_id: 'build_demo_2',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'demo-3',
    repo_name: 'target/inventory-api',
    branch: 'develop',
    status: 'failed' as const,
    progress: 45,
    duration: '3m 22s',
    author: 'alex.kim',
    commit_hash: 'c3d4e5f',
    current_step: null,
    vela_build_id: 'build_demo_3',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'demo-4',
    repo_name: 'target/web-frontend',
    branch: 'main',
    status: 'success' as const,
    progress: 100,
    duration: '12m 15s',
    author: 'emma.wilson',
    commit_hash: 'd4e5f6g',
    current_step: null,
    vela_build_id: 'build_demo_4',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'demo-5',
    repo_name: 'target/notification-service',
    branch: 'hotfix/payment-bug',
    status: 'pending' as const,
    progress: null,
    duration: null,
    author: 'david.park',
    commit_hash: 'e5f6g7h',
    current_step: null,
    vela_build_id: 'build_demo_5',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'demo-6',
    repo_name: 'target/user-management',
    branch: 'feature/mobile-redesign',
    status: 'running' as const,
    progress: 25,
    duration: null,
    author: 'lisa.johnson',
    commit_hash: 'f6g7h8i',
    current_step: 'Install Dependencies',
    vela_build_id: 'build_demo_6',
    created_at: new Date(Date.now() - 900000).toISOString(),
    updated_at: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'demo-7',
    repo_name: 'target/analytics-platform',
    branch: 'main',
    status: 'success' as const,
    progress: 100,
    duration: '15m 30s',
    author: 'sarah.chen',
    commit_hash: 'g7h8i9j',
    current_step: null,
    vela_build_id: 'build_demo_7',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    updated_at: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 'demo-8',
    repo_name: 'target/search-service',
    branch: 'develop',
    status: 'failed' as const,
    progress: 80,
    duration: '6m 12s',
    author: 'mike.rodriguez',
    commit_hash: 'h8i9j0k',
    current_step: null,
    vela_build_id: 'build_demo_8',
    created_at: new Date(Date.now() - 21600000).toISOString(),
    updated_at: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: 'demo-9',
    repo_name: 'target/mobile-app',
    branch: 'feature/checkout-v2',
    status: 'success' as const,
    progress: 100,
    duration: '9m 55s',
    author: 'alex.kim',
    commit_hash: 'i9j0k1l',
    current_step: null,
    vela_build_id: 'build_demo_9',
    created_at: new Date(Date.now() - 25200000).toISOString(),
    updated_at: new Date(Date.now() - 25200000).toISOString()
  },
  {
    id: 'demo-10',
    repo_name: 'target/payment-service',
    branch: 'main',
    status: 'running' as const,
    progress: 90,
    duration: null,
    author: 'emma.wilson',
    commit_hash: 'j0k1l2m',
    current_step: 'Deploy to Production',
    vela_build_id: 'build_demo_10',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    updated_at: new Date(Date.now() - 180000).toISOString()
  },
  {
    id: 'demo-11',
    repo_name: 'target/inventory-api',
    branch: 'hotfix/payment-bug',
    status: 'success' as const,
    progress: 100,
    duration: '7m 33s',
    author: 'david.park',
    commit_hash: 'k1l2m3n',
    current_step: null,
    vela_build_id: 'build_demo_11',
    created_at: new Date(Date.now() - 28800000).toISOString(),
    updated_at: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: 'demo-12',
    repo_name: 'target/web-frontend',
    branch: 'feature/mobile-redesign',
    status: 'failed' as const,
    progress: 35,
    duration: '2m 18s',
    author: 'lisa.johnson',
    commit_hash: 'l2m3n4o',
    current_step: null,
    vela_build_id: 'build_demo_12',
    created_at: new Date(Date.now() - 32400000).toISOString(),
    updated_at: new Date(Date.now() - 32400000).toISOString()
  },
  {
    id: 'demo-13',
    repo_name: 'target/notification-service',
    branch: 'develop',
    status: 'pending' as const,
    progress: null,
    duration: null,
    author: 'sarah.chen',
    commit_hash: 'm3n4o5p',
    current_step: null,
    vela_build_id: 'build_demo_13',
    created_at: new Date(Date.now() - 36000000).toISOString(),
    updated_at: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: 'demo-14',
    repo_name: 'target/user-management',
    branch: 'main',
    status: 'success' as const,
    progress: 100,
    duration: '11m 44s',
    author: 'mike.rodriguez',
    commit_hash: 'n4o5p6q',
    current_step: null,
    vela_build_id: 'build_demo_14',
    created_at: new Date(Date.now() - 39600000).toISOString(),
    updated_at: new Date(Date.now() - 39600000).toISOString()
  },
  {
    id: 'demo-15',
    repo_name: 'target/analytics-platform',
    branch: 'feature/checkout-v2',
    status: 'running' as const,
    progress: 55,
    duration: null,
    author: 'alex.kim',
    commit_hash: 'o5p6q7r',
    current_step: 'Build Application',
    vela_build_id: 'build_demo_15',
    created_at: new Date(Date.now() - 2700000).toISOString(),
    updated_at: new Date(Date.now() - 420000).toISOString()
  }
];

export const useDemoData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDemoPipelines = async () => {
    setLoading(true);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Demo Data Loaded",
      description: `Successfully loaded ${DEMO_PIPELINES.length} demo pipelines across various Target repositories.`,
    });
    
    setLoading(false);
  };

  return { createDemoPipelines, loading };
};
