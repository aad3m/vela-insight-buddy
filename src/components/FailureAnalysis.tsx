
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, Lightbulb, TrendingUp, Code, Clock, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FailurePattern {
  id: string;
  type: string;
  frequency: number;
  lastOccurrence: string;
  affectedRepos: string[];
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

const mockFailures: FailurePattern[] = [
  {
    id: '1',
    type: 'Test Container OOM',
    frequency: 12,
    lastOccurrence: '2 hours ago',
    affectedRepos: ['inventory-service', 'pricing-engine'],
    suggestion: 'Increase memory allocation to 4GB in .vela.yml test step',
    severity: 'high'
  },
  {
    id: '2',
    type: 'Flaky E2E Tests',
    frequency: 8,
    lastOccurrence: '4 hours ago',
    affectedRepos: ['target-web-frontend', 'mobile-app-api'],
    suggestion: 'Add retry logic and better wait conditions for checkout flow tests',
    severity: 'medium'
  },
  {
    id: '3',
    type: 'Docker Build Timeout',
    frequency: 5,
    lastOccurrence: '6 hours ago',
    affectedRepos: ['user-authentication'],
    suggestion: 'Enable BuildKit and multi-stage builds to reduce image size',
    severity: 'medium'
  }
];

const recentFailure = {
  repo: 'inventory-service',
  branch: 'hotfix/stock-calculation',
  step: 'Unit Tests',
  error: 'java.lang.OutOfMemoryError: Java heap space',
  logSnippet: `[ERROR] Tests run: 245, Failures: 0, Errors: 1, Skipped: 0
[ERROR] There was an error in the forked process
[ERROR] java.lang.OutOfMemoryError: Java heap space
[ERROR] 	at java.util.Arrays.copyOf(Arrays.java:3332)`,
  aiAnalysis: 'Memory allocation insufficient for test execution. The heap space is exhausted during unit test runs, likely due to increased test data size or memory leaks in test setup.',
  suggestedFix: 'Increase JVM heap size from 2GB to 4GB in maven-surefire-plugin configuration'
};

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
  const { toast } = useToast();

  const handleApplyFix = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Fix Applied Successfully",
        description: "Memory allocation has been increased to 4GB in the pipeline configuration.",
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
      description: "Slack notification sent to #backend-team channel.",
    });
  };

  const handleCreateFixPR = async (patternId: string) => {
    setSelectedPattern(patternId);
    try {
      // Simulate PR creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Fix PR Created",
        description: "Pull request #1234 created with the suggested fix.",
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

  return (
    <div className="space-y-6">
      {/* AI-Powered Recent Failure Analysis */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Failure Analysis
          </CardTitle>
          <CardDescription>
            Latest failure analyzed with intelligent log parsing and suggested fixes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-red-900">{recentFailure.repo}</h4>
                <p className="text-sm text-red-700">{recentFailure.branch} • {recentFailure.step}</p>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                Just Failed
              </Badge>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono mb-4">
              {recentFailure.logSnippet}
            </div>
            
            <Alert className="border-purple-200 bg-purple-50">
              <Brain className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>AI Analysis:</strong> {recentFailure.aiAnalysis}
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Suggested Fix:</p>
                  <p className="text-sm text-green-700">{recentFailure.suggestedFix}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyFix(recentFailure.suggestedFix)}
                  className="text-green-700 hover:text-green-800"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
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

      {/* Failure Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Common Failure Patterns
          </CardTitle>
          <CardDescription>
            Recurring issues detected across Target repositories with smart recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFailures.map((failure) => (
              <div key={failure.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{failure.type}</h4>
                      <p className="text-sm text-gray-600">
                        Occurred {failure.frequency} times • Last: {failure.lastOccurrence}
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
        </CardContent>
      </Card>
    </div>
  );
};
