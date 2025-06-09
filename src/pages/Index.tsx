
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Zap, TrendingUp, Users, GitBranch, Settings, LogOut, User, Brain, Database } from 'lucide-react';
import { PipelineStatus } from '@/components/PipelineStatus';
import { FailureAnalysis } from '@/components/FailureAnalysis';
import { TeamMetrics } from '@/components/TeamMetrics';
import { ConfigOptimizer } from '@/components/ConfigOptimizer';
import { SlackIntegration } from '@/components/SlackIntegration';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EnhancedFailureAnalysis } from '@/components/EnhancedFailureAnalysis';
import { useDemoData } from '@/hooks/useDemoData';
import { usePipelines } from '@/hooks/usePipelines';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createDemoPipelines, loading: demoLoading } = useDemoData();
  const { pipelines } = usePipelines();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Calculate metrics from actual pipeline data
  const activePipelines = pipelines.filter(p => p.status === 'running').length;
  const failedPipelines = pipelines.filter(p => p.status === 'failed').length;
  const successfulPipelines = pipelines.filter(p => p.status === 'success').length;
  const totalPipelines = pipelines.length;
  const successRate = totalPipelines > 0 ? Math.round((successfulPipelines / totalPipelines) * 100) : 0;

  // Calculate average duration from successful pipelines
  const avgDuration = pipelines
    .filter(p => p.duration && p.status === 'success')
    .map(p => {
      const match = p.duration?.match(/(\d+)m\s*(\d+)?s?/);
      if (match) {
        const minutes = parseInt(match[1]) || 0;
        const seconds = parseInt(match[2]) || 0;
        return minutes + (seconds / 60);
      }
      return 0;
    })
    .reduce((acc, curr, _, arr) => arr.length > 0 ? acc + curr / arr.length : 0, 0);

  const formattedAvgDuration = avgDuration > 0 ? `${Math.floor(avgDuration)}m` : '0m';

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "See you next time!"
        });
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Settings panel coming soon! This will include Vela API configuration, notification preferences, and more.",
    });
  };

  const handleCreateDemoData = async () => {
    await createDemoPipelines();
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading VelaBuddy...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">VelaBuddy</h1>
                <p className="text-sm text-gray-600">Smart CI/CD Companion for Target Engineers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Connected to Vela
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateDemoData}
                disabled={demoLoading}
              >
                <Database className="w-4 h-4 mr-2" />
                {demoLoading ? 'Creating...' : 'Add Demo Data'}
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{activePipelines}</div>
              <p className="text-sm text-gray-500 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{failedPipelines}</div>
              <p className="text-sm text-gray-500 mt-1">Needs attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{successRate}%</div>
              <p className="text-sm text-gray-500 mt-1">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{formattedAvgDuration}</div>
              <p className="text-sm text-gray-500 mt-1">Deploy to prod</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pipelines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200">
            <TabsTrigger value="pipelines" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Pipelines
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Enhanced AI
            </TabsTrigger>
            <TabsTrigger value="failures" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Quick Analysis
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Team Metrics
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Optimizer
            </TabsTrigger>
            <TabsTrigger value="slack" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Slack
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipelines">
            <PipelineStatus />
          </TabsContent>

          <TabsContent value="analysis">
            <EnhancedFailureAnalysis />
          </TabsContent>

          <TabsContent value="failures">
            <FailureAnalysis />
          </TabsContent>

          <TabsContent value="metrics">
            <TeamMetrics />
          </TabsContent>

          <TabsContent value="optimizer">
            <ConfigOptimizer />
          </TabsContent>

          <TabsContent value="slack">
            <SlackIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
