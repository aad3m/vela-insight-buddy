import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, FileText, CheckCircle, AlertTriangle, Clock, Gauge, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleApplyOptimization = async (optimizationId: string) => {
    setApplyingOptimization(optimizationId);
    try {
      // Simulate applying optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const optimization = optimizations.find(opt => opt.id === optimizationId);
      toast({
        title: "Optimization Applied",
        description: `${optimization?.title} has been applied to ${optimization?.repo}`,
      });
    } catch (error) {
      toast({
        title: "Error",
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
      // Simulate AI config generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Custom Config Generated",
        description: "AI-optimized .vela.yml configuration has been generated based on your repository patterns.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate config. Please try again.",
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
            <Zap className="w-5 h-5 text-yellow-600" />
            Vela Configuration Optimizer
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to improve your pipeline performance, cost, and reliability
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

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="examples">Config Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <div className="space-y-4">
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
          </div>
        </TabsContent>

        <TabsContent value="examples">
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
