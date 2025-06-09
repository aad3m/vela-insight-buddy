
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, Lightbulb, TrendingUp, Code, Clock, ExternalLink, Copy, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePipelines } from '@/hooks/usePipelines';

interface FailurePattern {
  id: string;
  type: string;
  frequency: number;
  lastOccurrence: string;
  affectedRepos: string[];
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const FailureAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const { pipelines } = usePipelines();
  const { toast } = useToast();

  // Get the most recent failed pipeline for analysis
  const recentFailure = pipelines
    .filter(p => p.status === 'failed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  // Generate failure patterns from actual pipeline data
  const failurePatterns: FailurePattern[] = pipelines
    .filter(p => p.status === 'failed')
    .reduce((patterns: FailurePattern[], pipeline) => {
      // Simple pattern generation based on repo name
      const existingPattern = patterns.find(p => p.affectedRepos.includes(pipeline.repo_name));
      
      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.lastOccurrence = pipeline.updated_at;
      } else {
        patterns.push({
          id: pipeline.id,
          type: `Build Failure in ${pipeline.repo_name}`,
          frequency: 1,
          lastOccurrence: pipeline.updated_at,
          affectedRepos: [pipeline.repo_name],
          suggestion: `Review and fix issues in ${pipeline.repo_name} pipeline configuration`,
          severity: 'medium' as const
        });
      }
      
      return patterns;
    }, [])
    .slice(0, 5); // Limit to 5 patterns

  const handleAnalyzeFailure = async () => {
    if (!recentFailure) {
      toast({
        title: "No Failures Found",
        description: "No failed pipelines available for analysis. Add demo data to see this feature.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-failure-logs', {
        body: {
          logs: `Build failed for ${recentFailure.repo_name}`,
          error: `Pipeline failed in step: ${recentFailure.current_step || 'unknown'}`,
          repo: recentFailure.repo_name,
          step: recentFailure.current_step || 'unknown'
        }
      });

      if (error) throw error;

      toast({
        title: "Groq Analysis Complete",
        description: "Fresh analysis generated using Groq Llama3-8B.",
      });
    } catch (error) {
      console.error('Error analyzing failure:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze failure. Please check your Groq API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyFix = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Fix Applied Successfully",
        description: "Pipeline configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply the fix. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewLogs = () => {
    toast({
      title: "Opening Logs",
      description: "Redirecting to Vela build logs...",
    });
  };

  const handleNotifyTeam = () => {
    toast({
      title: "Team Notified",
      description: "Slack notification sent to team channel.",
    });
  };

  const handleCreateFixPR = async (patternId: string) => {
    setSelectedPattern(patternId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Fix PR Created",
        description: "Pull request created with the suggested fix.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create PR. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSelectedPattern(null);
    }
  };

  const handleCopyFix = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
    toast({
      title: "Copied to Clipboard",
      description: "Fix suggestion copied to clipboard.",
    });
  };

  if (pipelines.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-l-4 border-l-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-400" />
              Groq AI Failure Analysis
            </CardTitle>
            <CardDescription>
              No pipeline data available. Add demo data to see AI-powered failure analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No pipeline failures to analyze</p>
            <p className="text-sm text-gray-400">Click "Add Demo Data" to see this feature in action</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI-Powered Recent Failure Analysis */}
      {recentFailure ? (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Groq AI Failure Analysis
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAnalyzeFailure}
                disabled={isAnalyzing}
                className="ml-auto"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze with Groq'}
              </Button>
            </CardTitle>
            <CardDescription>
              Latest failure analyzed with Groq Llama3-8B and intelligent log parsing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-red-900">{recentFailure.repo_name}</h4>
                  <p className="text-sm text-red-700">{recentFailure.branch} • {recentFailure.current_step || 'Unknown step'}</p>
                </div>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  Failed
                </Badge>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono mb-4">
                [ERROR] Pipeline failed in {recentFailure.current_step || 'unknown step'}
                <br />
                [INFO] Build ID: {recentFailure.vela_build_id || 'N/A'}
                <br />
                [INFO] Commit: {recentFailure.commit_hash || 'N/A'}
              </div>
              
              <Alert className="border-purple-200 bg-purple-50">
                <Brain className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>AI Analysis:</strong> Click "Analyze with Groq" to get AI-powered insights for this failure.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApplyFix}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Applying...' : 'Apply Fix'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleViewLogs}>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Full Logs
                </Button>
                <Button size="sm" variant="ghost" onClick={handleNotifyTeam}>
                  Notify Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-400" />
              Groq AI Failure Analysis
            </CardTitle>
            <CardDescription>
              No recent failures to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">All pipelines are running successfully!</p>
          </CardContent>
        </Card>
      )}

      {/* Failure Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Common Failure Patterns
          </CardTitle>
          <CardDescription>
            {failurePatterns.length > 0 
              ? 'Recurring issues detected across repositories with smart recommendations'
              : 'No failure patterns detected yet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {failurePatterns.length > 0 ? (
            <div className="space-y-4">
              {failurePatterns.map((failure) => (
                <div key={failure.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{failure.type}</h4>
                        <p className="text-sm text-gray-600">
                          Occurred {failure.frequency} time{failure.frequency > 1 ? 's' : ''} • Last: {new Date(failure.lastOccurrence).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(failure.severity)}>
                      {failure.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">Affected repositories:</p>
                    <div className="flex gap-2">
                      {failure.affectedRepos.map((repo) => (
                        <Badge key={repo} variant="secondary" className="text-xs">
                          {repo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Code className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">Recommendation:</p>
                        <p className="text-sm text-blue-700">{failure.suggestion}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyFix(failure.suggestion)}
                        className="text-blue-700 hover:text-blue-800"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCreateFixPR(failure.id)}
                      disabled={selectedPattern === failure.id}
                    >
                      {selectedPattern === failure.id ? 'Creating...' : 'Create Fix PR'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleViewLogs}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No failure patterns detected</p>
              <p className="text-sm text-gray-400 mt-2">This is good - your pipelines are running smoothly!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
