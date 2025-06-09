import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, FileText, CheckCircle, AlertTriangle, Clock, Gauge, Copy, Download, Upload, FileCheck, Brain, GitCompare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Optimization {
  id: string;
  type: 'performance' | 'cost' | 'reliability';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  savingsTime?: string;
  savingsCost?: string;
  repo: string;
  file: string;
}

const optimizations: Optimization[] = [
  {
    id: '1',
    type: 'performance',
    title: 'Enable Docker BuildKit',
    description: 'Use BuildKit for faster Docker builds with layer caching and parallel execution',
    impact: 'high',
    effort: 'low',
    savingsTime: '40% faster builds',
    repo: 'target-web-frontend',
    file: '.vela.yml'
  },
  {
    id: '2',
    type: 'cost',
    title: 'Optimize Test Parallelization',
    description: 'Split test suites across multiple workers to reduce total runtime',
    impact: 'medium',
    effort: 'medium',
    savingsTime: '25% faster tests',
    savingsCost: '$120/month',
    repo: 'inventory-service',
    file: '.vela.yml'
  },
  {
    id: '3',
    type: 'reliability',
    title: 'Add Retry Logic for Flaky Steps',
    description: 'Automatically retry known flaky deployment steps to improve success rate',
    impact: 'high',
    effort: 'low',
    repo: 'mobile-app-api',
    file: '.vela.yml'
  },
  {
    id: '4',
    type: 'performance',
    title: 'Implement Smart Caching',
    description: 'Cache dependencies and build artifacts between pipeline runs',
    impact: 'high',
    effort: 'medium',
    savingsTime: '60% faster dependency install',
    repo: 'pricing-engine',
    file: '.vela.yml'
  }
];

const configExample = {
  before: `version: "1"
worker:
  platform: linux/amd64

steps:
  - name: test
    image: node:18
    commands:
      - npm install
      - npm test
      
  - name: build
    image: docker:latest
    commands:
      - docker build -t app .`,
      
  after: `version: "1"
worker:
  platform: linux/amd64

steps:
  - name: restore-cache
    image: plugins/cache
    settings:
      restore: true
      key: deps-{{ checksum "package-lock.json" }}
      
  - name: test
    image: node:18
    commands:
      - npm ci --cache .npm
      - npm test -- --parallel
    environment:
      - NODE_OPTIONS="--max-old-space-size=4096"
      
  - name: save-cache
    image: plugins/cache
    settings:
      rebuild: true
      key: deps-{{ checksum "package-lock.json" }}
      mount:
        - .npm
        - node_modules
      
  - name: build
    image: docker:latest
    commands:
      - export DOCKER_BUILDKIT=1
      - docker build --cache-from=app:latest -t app .`
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'performance':
      return <Gauge className="w-4 h-4 text-blue-500" />;
    case 'cost':
      return <Clock className="w-4 h-4 text-green-500" />;
    case 'reliability':
      return <CheckCircle className="w-4 h-4 text-purple-500" />;
    default:
      return <Zap className="w-4 h-4 text-gray-500" />;
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
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

const getEffortColor = (effort: string) => {
  switch (effort) {
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const ConfigOptimizer = () => {
  const [selectedOptimization, setSelectedOptimization] = useState<Optimization | null>(null);
  const [applyingOptimization, setApplyingOptimization] = useState<string | null>(null);
  const [generatingConfig, setGeneratingConfig] = useState(false);
  const [uploadedConfig, setUploadedConfig] = useState<string>('');
  const [analyzingConfig, setAnalyzingConfig] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [optimizedConfig, setOptimizedConfig] = useState<string>('');
  const [showDiff, setShowDiff] = useState(false);
  const { toast } = useToast();

  const handleApplyOptimization = async (optimizationId: string) => {
    setApplyingOptimization(optimizationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Optimization Applied",
        description: "The optimization has been successfully applied to your configuration.",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Failed to apply optimization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplyingOptimization(null);
    }
  };

  const handleGenerateCustomConfig = async () => {
    setGeneratingConfig(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const customConfig = `version: "1"
worker:
  platform: linux/amd64

steps:
  - name: setup
    image: alpine/git
    commands:
      - git submodule update --init --recursive
      
  - name: cache-restore
    image: plugins/cache
    settings:
      restore: true
      key: custom-deps-{{ checksum "requirements.txt" }}
      
  - name: build
    image: node:18
    commands:
      - npm ci --cache .npm
      - npm run build
    environment:
      - NODE_ENV=production
      
  - name: test
    image: node:18
    commands:
      - npm run test:coverage
    depends_on:
      - build
      
  - name: deploy
    image: plugins/docker
    settings:
      registry: registry.example.com
      repo: custom-app
      tags:
        - latest
        - "\${DRONE_COMMIT_SHA:0:8}"
    depends_on:
      - test
    when:
      branch: [main]`;

      setOptimizedConfig(customConfig);
      
      toast({
        title: "Custom Config Generated",
        description: "A custom optimized configuration has been generated for your project.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate custom configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingConfig(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.yml') || file.name.endsWith('.yaml')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setUploadedConfig(content);
          toast({
            title: "File Uploaded",
            description: `${file.name} has been loaded successfully.`,
          });
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .yml or .yaml file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAnalyzeConfig = async () => {
    if (!uploadedConfig) {
      toast({
        title: "No Configuration",
        description: "Please upload a .vela.yml file first.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzingConfig(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-vela-config', {
        body: {
          config: uploadedConfig,
          analysisType: 'analyze'
        }
      });

      if (error) throw error;

      setAnalysisResult(data.result);
      
      toast({
        title: "Analysis Complete",
        description: "Your configuration has been analyzed with Groq AI recommendations.",
      });
    } catch (error) {
      console.error('Error analyzing config:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze configuration. Please check your Groq API key and try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingConfig(false);
    }
  };

  const handleOptimizeConfig = async () => {
    if (!uploadedConfig) {
      toast({
        title: "No Configuration",
        description: "Please upload a .vela.yml file first.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingConfig(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-vela-config', {
        body: {
          config: uploadedConfig,
          analysisType: 'optimize'
        }
      });

      if (error) throw error;

      setOptimizedConfig(data.result);
      setShowDiff(true); // Show diff view by default when optimization is complete
      
      toast({
        title: "Configuration Optimized",
        description: "Groq AI has generated an optimized version of your .vela.yml file.",
      });
    } catch (error) {
      console.error('Error optimizing config:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize configuration. Please check your Groq API key and try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingConfig(false);
    }
  };

  const handleCopyConfig = (config: string) => {
    navigator.clipboard.writeText(config);
    toast({
      title: "Copied to Clipboard",
      description: "Configuration copied to clipboard.",
    });
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([configExample.after], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.vela.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Config Downloaded",
      description: "Optimized .vela.yml file has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Groq AI Configuration Optimizer
          </CardTitle>
          <CardDescription>
            Groq-powered recommendations to improve your pipeline performance, cost, and reliability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Gauge className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">2.3x</div>
              <p className="text-sm text-blue-700">Avg Speed Improvement</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">$450</div>
              <p className="text-sm text-green-700">Monthly Savings Potential</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <p className="text-sm text-purple-700">Success Rate Target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
          <TabsTrigger value="examples">Config Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {optimizations.map((opt) => (
            <Card key={opt.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOptimization(opt)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(opt.type)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{opt.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getImpactColor(opt.impact)}>
                      {opt.impact} impact
                    </Badge>
                    <Badge variant="outline" className={getEffortColor(opt.effort)}>
                      {opt.effort} effort
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📁 {opt.repo}</span>
                    <span>📄 {opt.file}</span>
                  </div>
                  
                  <div className="flex gap-4 text-sm">
                    {opt.savingsTime && (
                      <span className="text-blue-600 font-medium">{opt.savingsTime}</span>
                    )}
                    {opt.savingsCost && (
                      <span className="text-green-600 font-medium">{opt.savingsCost}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyOptimization(opt.id);
                    }}
                    disabled={applyingOptimization === opt.id}
                  >
                    {applyingOptimization === opt.id ? 'Applying...' : 'Apply Optimization'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Your .vela.yml File
              </CardTitle>
              <CardDescription>
                Upload your existing Vela configuration file to get Groq AI-powered analysis and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".yml,.yaml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="config-upload"
                />
                <label htmlFor="config-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload .vela.yml file
                  </p>
                  <p className="text-sm text-gray-600">
                    Or drag and drop your configuration file here
                  </p>
                </label>
              </div>

              {uploadedConfig && (
                <div className="space-y-4">
                  <Alert>
                    <FileCheck className="w-4 h-4" />
                    <AlertDescription>
                      Configuration file loaded successfully! You can now analyze or optimize it with Groq AI.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnalyzeConfig}
                      disabled={analyzingConfig}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {analyzingConfig ? 'Analyzing...' : 'Analyze with Groq AI'}
                    </Button>
                    <Button 
                      onClick={handleOptimizeConfig}
                      disabled={generatingConfig}
                      variant="outline"
                    >
                      {generatingConfig ? 'Optimizing...' : 'Generate Optimized Version'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Groq AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{analysisResult}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {optimizedConfig && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Groq AI Optimized Configuration
                </CardTitle>
                <CardDescription>
                  Groq AI-generated optimized version of your .vela.yml file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={showDiff ? "default" : "outline"}
                    onClick={() => setShowDiff(true)}
                  >
                    <GitCompare className="w-3 h-3 mr-1" />
                    Show Diff
                  </Button>
                  <Button
                    size="sm"
                    variant={!showDiff ? "default" : "outline"}
                    onClick={() => setShowDiff(false)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Optimized Only
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyConfig(optimizedConfig)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => {
                      const blob = new Blob([optimizedConfig], { type: 'text/yaml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = '.vela-optimized.yml';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Config Downloaded",
                        description: "Optimized .vela.yml file has been downloaded.",
                      });
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
                
                {showDiff ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-red-700">Original Configuration</h4>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Before
                        </Badge>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{uploadedConfig}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-green-700">Optimized Configuration</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          After
                        </Badge>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{optimizedConfig}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{optimizedConfig}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {uploadedConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Original Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={uploadedConfig}
                  onChange={(e) => setUploadedConfig(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Your .vela.yml content will appear here..."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Before & After: Optimized .vela.yml
              </CardTitle>
              <CardDescription>
                Example of how VelaBuddy optimizes your pipeline configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  This optimization adds caching, parallel execution, and BuildKit support - reducing build time by ~60%
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-700">❌ Before (Unoptimized)</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyConfig(configExample.before)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{configExample.before}</pre>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-700">✅ After (Optimized)</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyConfig(configExample.after)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{configExample.after}</pre>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApplyOptimization('example')}
                  disabled={applyingOptimization === 'example'}
                >
                  {applyingOptimization === 'example' ? 'Applying...' : 'Apply This Optimization'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGenerateCustomConfig}
                  disabled={generatingConfig}
                >
                  {generatingConfig ? 'Generating...' : 'Generate Custom Config'}
                </Button>
                <Button variant="outline" onClick={handleDownloadConfig}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
