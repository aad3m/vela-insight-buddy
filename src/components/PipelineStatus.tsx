
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Play, GitBranch, User } from 'lucide-react';

interface Pipeline {
  id: string;
  repo: string;
  branch: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  progress: number;
  duration: string;
  author: string;
  commit: string;
  step: string;
}

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    repo: 'target-web-frontend',
    branch: 'feature/checkout-improvements',
    status: 'running',
    progress: 75,
    duration: '4m 32s',
    author: 'sarah.chen',
    commit: 'a1b2c3d',
    step: 'Deploy to staging'
  },
  {
    id: '2',
    repo: 'inventory-service',
    branch: 'hotfix/stock-calculation',
    status: 'failed',
    progress: 45,
    duration: '2m 18s',
    author: 'mike.rodriguez',
    commit: 'x7y8z9a',
    step: 'Unit tests'
  },
  {
    id: '3',
    repo: 'mobile-app-api',
    branch: 'main',
    status: 'success',
    progress: 100,
    duration: '6m 45s',
    author: 'alex.kim',
    commit: 'p4q5r6s',
    step: 'Production deploy'
  },
  {
    id: '4',
    repo: 'pricing-engine',
    branch: 'feature/dynamic-pricing',
    status: 'running',
    progress: 30,
    duration: '1m 52s',
    author: 'emma.wilson',
    commit: 'f8g9h0i',
    step: 'Integration tests'
  },
  {
    id: '5',
    repo: 'user-authentication',
    branch: 'security/oauth-update',
    status: 'pending',
    progress: 0,
    duration: '0s',
    author: 'david.patel',
    commit: 'j1k2l3m',
    step: 'Waiting for approval'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running':
      return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants = {
    running: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };
  
  return (
    <Badge variant="outline" className={variants[status as keyof typeof variants]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const PipelineStatus = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Active Pipeline Runs
          </CardTitle>
          <CardDescription>
            Real-time status of all Vela pipeline executions across Target repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPipelines.map((pipeline) => (
              <div key={pipeline.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(pipeline.status)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{pipeline.repo}</h4>
                      <p className="text-sm text-gray-600">{pipeline.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(pipeline.status)}
                    <span className="text-sm text-gray-500">{pipeline.duration}</span>
                  </div>
                </div>
                
                {pipeline.status === 'running' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Current step: {pipeline.step}</span>
                      <span>{pipeline.progress}%</span>
                    </div>
                    <Progress value={pipeline.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {pipeline.author}
                    </span>
                    <span>#{pipeline.commit}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {pipeline.status === 'failed' && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        View Logs
                      </Button>
                    )}
                    {pipeline.status === 'pending' && (
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        Approve
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
