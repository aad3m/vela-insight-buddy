
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Zap, TrendingUp, Users, GitBranch, Settings, LogOut, User } from 'lucide-react';
import { PipelineStatus } from '@/components/PipelineStatus';
import { FailureAnalysis } from '@/components/FailureAnalysis';
import { TeamMetrics } from '@/components/TeamMetrics';
import { ConfigOptimizer } from '@/components/ConfigOptimizer';
import { SlackIntegration } from '@/components/SlackIntegration';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activePipelines, setActivePipelines] = useState(12);
  const [failedPipelines, setFailedPipelines] = useState(3);
  const [successRate, setSuccessRate] = useState(94);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
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
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipelines(prev => Math.max(8, prev + Math.floor(Math.random() * 3) - 1));
      setFailedPipelines(prev => Math.max(0, Math.min(5, prev + Math.floor(Math.random() * 3) - 1)));
      setSuccessRate(prev => Math.max(85, Math.min(98, prev + Math.floor(Math.random() * 3) - 1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
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
              <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">8.4m</div>
              <p className="text-sm text-gray-500 mt-1">Deploy to prod</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pipelines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200">
            <TabsTrigger value="pipelines" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Pipelines
            </TabsTrigger>
            <TabsTrigger value="failures" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              AI Analysis
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
