
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, AlertTriangle, Lightbulb, Code, ExternalLink, Copy, BookOpen, Zap, Info, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePipelines } from '@/hooks/usePipelines';

interface EnhancedAnalysis {
  analysis: string;
  sections: {
    rootCause: string;
    workarounds: string;
    solutions: string;
    codeExamples: string;
    prevention: string;
    bestPractices: string;
  };
  velaDocs: string[];
  aiProvider: string;
  timestamp: string;
}

interface FailureData {
  repo: string;
  branch: string;
  step: string;
  error: string;
  logs: string;
  pipelineConfig?: string;
}

export const EnhancedFailureAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EnhancedAnalysis | null>(null);
  const { pipelines } = usePipelines();
  const { toast } = useToast();

  // Get the most recent failed pipeline for analysis
  const recentFailure = pipelines
    .filter(p => p.status === 'failed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  const selectedFailure: FailureData | null = recentFailure ? {
    repo: recentFailure.repo_name,
    branch: recentFailure.branch,
    step: recentFailure.current_step || 'unknown',
    error: `Pipeline failed in step: ${recentFailure.current_step || 'unknown'}`,
    logs: `[INFO] Building pipeline for ${recentFailure.repo_name}
[INFO] Branch: ${recentFailure.branch}
[INFO] Build ID: ${recentFailure.vela_build_id || 'N/A'}
[INFO] Commit: ${recentFailure.commit_hash || 'N/A'}
[ERROR] Pipeline failed in step: ${recentFailure.current_step || 'unknown'}
[ERROR] Build process terminated with exit code 1`,
    pipelineConfig: `version: "1"
steps:
  - name: ${recentFailure.current_step || 'build'}
    image: alpine
    commands:
      - echo "Building ${recentFailure.repo_name}"
      - # Build commands here`
  } : null;

  const handleEnhancedAnalysis = async () => {
    if (!selectedFailure) {
      toast({
        title: "No Failures Found",
        description: "No failed pipelines available for analysis. Add demo data to see this feature.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-failure-analysis', {
        body: {
          logs: selectedFailure.logs,
          error: selectedFailure.error,
          repo: selectedFailure.repo,
          step: selectedFailure.step,
          branch: selectedFailure.branch,
          pipeline_config: selectedFailure.pipelineConfig
        }
      });

      if (error) throw error;

      setAnalysis(data);
      
      toast({
        title: "Enhanced Analysis Complete",
        description: `Analysis completed using ${data.aiProvider}`,
      });
    } catch (error) {
      console.error('Error in enhanced analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Enhanced analysis failed, but basic analysis is still available.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to Clipboard",
      description: "Code snippet copied to clipboard.",
    });
  };

  const handleOpenVelaDocs = (url: string) => {
    window.open(url, '_blank');
    toast({
      title: "Opening Vela Docs",
      description: "Relevant documentation opened in new tab.",
    });
  };

  if (pipelines.length === 0) {
    return (
      <div className="space-y-6">
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="w-4 h-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>Enhanced AI Analysis:</strong> No pipeline data available. Add demo data to see advanced AI-powered failure analysis.
          </AlertDescription>
        </Alert>

        <Card className="border-l-4 border-l-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-400" />
              Enhanced AI Failure Analysis
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 ml-auto">
                Groq + Vela Docs
              </Badge>
            </CardTitle>
            <CardDescription>
              Deep failure analysis with Vela documentation context and Groq AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No pipeline data available</p>
            <p className="text-sm text-gray-400">Click "Add Demo Data" to see enhanced AI analysis in action</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Provider Information */}
      <Alert className="border-green-200 bg-green-50">
        <Info className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Powered by Groq Llama3-8B:</strong> Fast, free AI analysis with Vela documentation context.
          Enhanced failure analysis using cutting-edge open-source AI models.
        </AlertDescription>
      </Alert>

      {/* Current Failure Analysis */}
      {selectedFailure ? (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Enhanced AI Failure Analysis
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-auto">
                Groq + Vela Docs
              </Badge>
            </CardTitle>
            <CardDescription>
              Deep failure analysis with Vela documentation context and Groq AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-red-900">{selectedFailure.repo}</h4>
                  <p className="text-sm text-red-700">{selectedFailure.branch} • {selectedFailure.step}</p>
                </div>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  Active Failure
                </Badge>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono mb-4 max-h-40 overflow-y-auto">
                {selectedFailure.logs}
              </div>
              
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> {selectedFailure.error}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleEnhancedAnalysis}
                disabled={isAnalyzing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing with Groq...' : 'Run Groq Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-400" />
              Enhanced AI Failure Analysis
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 ml-auto">
                Groq + Vela Docs
              </Badge>
            </CardTitle>
            <CardDescription>
              No recent failures to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">All pipelines are running successfully!</p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Groq AI Analysis Results
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {analysis.aiProvider}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 ml-auto">
                {new Date(analysis.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis with actionable solutions and Vela best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workarounds">Quick Fixes</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
                <TabsTrigger value="code">Code Examples</TabsTrigger>
                <TabsTrigger value="prevention">Prevention</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Root Cause
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{analysis.sections.rootCause || 'Analysis could not determine root cause'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Best Practices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{analysis.sections.bestPractices || 'No specific best practices identified'}</p>
                    </CardContent>
                  </Card>
                </div>

                {analysis.velaDocs.length > 0 && (
                  <Alert>
                    <BookOpen className="w-4 h-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>Referenced {analysis.velaDocs.length} Vela documentation pages</span>
                        <div className="flex gap-2">
                          {analysis.velaDocs.slice(0, 2).map((url, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenVelaDocs(url)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Docs {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="workarounds" className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Quick Workarounds:</strong>
                    <div className="mt-2 whitespace-pre-wrap">{analysis.sections.workarounds || 'No specific workarounds identified'}</div>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="solutions" className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Lightbulb className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Long-term Solutions:</strong>
                    <div className="mt-2 whitespace-pre-wrap">{analysis.sections.solutions || 'No specific solutions identified'}</div>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                {analysis.sections.codeExamples && (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-300">Code Examples</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyCode(analysis.sections.codeExamples)}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap">{analysis.sections.codeExamples}</pre>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="prevention" className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Code className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Prevention Strategies:</strong>
                    <div className="mt-2 whitespace-pre-wrap">{analysis.sections.prevention || 'No specific prevention strategies identified'}</div>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
