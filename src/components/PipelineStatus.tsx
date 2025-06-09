
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Play, GitBranch, User, Loader2, ExternalLink, RotateCcw } from 'lucide-react';
import { usePipelines } from '@/hooks/usePipelines';
import { useToast } from '@/hooks/use-toast';

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
  const { pipelines, loading, error, refetch } = usePipelines();
  const { toast } = useToast();

  const handleViewLogs = (pipelineId: string, buildId?: string) => {
    toast({
      title: "Opening Logs",
      description: `Redirecting to Vela build logs for build ${buildId || pipelineId.slice(0, 8)}...`,
    });
    // In a real implementation, this would open the Vela logs URL
  };

  const handleApprove = async (pipelineId: string) => {
    try {
      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Pipeline Approved",
        description: "Pipeline has been approved and will continue execution.",
      });
      
      // Refresh the pipelines list
      refetch();
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve pipeline. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (pipelineId: string) => {
    toast({
      title: "Opening Details",
      description: `Loading detailed view for pipeline ${pipelineId.slice(0, 8)}...`,
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Fetching latest pipeline data...",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Active Pipeline Runs
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading pipelines...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Active Pipeline Runs
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">Error loading pipelines: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-600" />
                Active Pipeline Runs
              </CardTitle>
              <CardDescription>
                Real-time status of your Vela pipeline executions across Target repositories
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pipelines.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pipelines found</h3>
              <p className="text-gray-600">
                You don't have access to any pipeline runs yet. Contact your team lead to get added to relevant repositories.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pipelines.map((pipeline) => (
                <div key={pipeline.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(pipeline.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{pipeline.repo_name}</h4>
                        <p className="text-sm text-gray-600">{pipeline.branch}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(pipeline.status)}
                      <span className="text-sm text-gray-500">
                        {pipeline.duration || '0s'}
                      </span>
                    </div>
                  </div>
                  
                  {pipeline.status === 'running' && pipeline.progress !== null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Current step: {pipeline.current_step || 'Running...'}</span>
                        <span>{pipeline.progress}%</span>
                      </div>
                      <Progress value={pipeline.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {pipeline.author || 'Unknown'}
                      </span>
                      {pipeline.commit_hash && (
                        <span>#{pipeline.commit_hash.substring(0, 7)}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {pipeline.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleViewLogs(pipeline.id, pipeline.vela_build_id)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Logs
                        </Button>
                      )}
                      {pipeline.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleApprove(pipeline.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDetails(pipeline.id)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
