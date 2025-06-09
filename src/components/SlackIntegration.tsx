
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Bell, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SlackNotification {
  id: string;
  type: 'success' | 'failure' | 'approval' | 'warning';
  repo: string;
  message: string;
  timestamp: string;
  channel: string;
}

const recentNotifications: SlackNotification[] = [
  {
    id: '1',
    type: 'failure',
    repo: 'inventory-service',
    message: 'Build failed: Test container OOM\'d. Suggest increasing memory to 4GB.',
    timestamp: '2 min ago',
    channel: '#backend-team'
  },
  {
    id: '2',
    type: 'approval',
    repo: 'target-web-frontend',
    message: 'PR #2931 ready for production deploy. Last 3 similar builds passed.',
    timestamp: '15 min ago',
    channel: '#frontend-team'
  },
  {
    id: '3',
    type: 'warning',
    repo: 'pricing-engine',
    message: 'Deploy delayed: 48hr approval bottleneck detected. Consider auto-approval for minor changes.',
    timestamp: '1 hour ago',
    channel: '#platform-team'
  },
  {
    id: '4',
    type: 'success',
    repo: 'mobile-app-api',
    message: 'Production deploy completed successfully in 6m 45s.',
    timestamp: '2 hours ago',
    channel: '#mobile-team'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failure':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'approval':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-l-green-500 bg-green-50';
    case 'failure':
      return 'border-l-red-500 bg-red-50';
    case 'approval':
      return 'border-l-blue-500 bg-blue-50';
    case 'warning':
      return 'border-l-yellow-500 bg-yellow-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
};

export const SlackIntegration = () => {
  const [slackToken, setSlackToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState({
    buildFailures: true,
    deploySuccess: false,
    approvalNeeded: true,
    longRunning: true,
    securityAlerts: true
  });
  const { toast } = useToast();

  const handleConnect = () => {
    if (slackToken) {
      setIsConnected(true);
      toast({
        title: "Slack Connected",
        description: "VelaBuddy is now connected to your Slack workspace.",
      });
    }
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: `${key} notifications ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={isConnected ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Connect VelaBuddy to your Slack workspace for intelligent pipeline notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <Alert>
                <Bell className="w-4 h-4" />
                <AlertDescription>
                  Connect your Slack workspace to receive smart notifications about pipeline events, failures, and optimization suggestions.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="slack-token">Slack Bot Token</Label>
                <Input
                  id="slack-token"
                  placeholder="xoxb-your-slack-bot-token"
                  value={slackToken}
                  onChange={(e) => setSlackToken(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Create a Slack app and add the bot token here. Need help? Check our setup guide.
                </p>
              </div>
              
              <Button onClick={handleConnect} disabled={!slackToken} className="bg-green-600 hover:bg-green-700">
                Connect to Slack
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700">Connected to Target Engineering Workspace</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">24</div>
                  <p className="text-sm text-green-700">Notifications sent today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <p className="text-sm text-green-700">Channels configured</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <p className="text-sm text-green-700">Delivery success rate</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure which events trigger Slack notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="build-failures" className="font-medium">Build Failures</Label>
                  <p className="text-sm text-gray-600">Get notified when builds fail with AI analysis</p>
                </div>
                <Switch 
                  id="build-failures"
                  checked={notifications.buildFailures}
                  onCheckedChange={(value) => handleNotificationToggle('buildFailures', value)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="deploy-success" className="font-medium">Deploy Success</Label>
                  <p className="text-sm text-gray-600">Celebrate successful production deployments</p>
                </div>
                <Switch 
                  id="deploy-success"
                  checked={notifications.deploySuccess}
                  onCheckedChange={(value) => handleNotificationToggle('deploySuccess', value)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="approval-needed" className="font-medium">Approval Needed</Label>
                  <p className="text-sm text-gray-600">Remind team when PRs need approval</p>
                </div>
                <Switch 
                  id="approval-needed"
                  checked={notifications.approvalNeeded}
                  onCheckedChange={(value) => handleNotificationToggle('approvalNeeded', value)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="long-running" className="font-medium">Long-Running Builds</Label>
                  <p className="text-sm text-gray-600">Alert when builds exceed expected duration</p>
                </div>
                <Switch 
                  id="long-running"
                  checked={notifications.longRunning}
                  onCheckedChange={(value) => handleNotificationToggle('longRunning', value)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="security-alerts" className="font-medium">Security Alerts</Label>
                  <p className="text-sm text-gray-600">Critical security issues in dependencies</p>
                </div>
                <Switch 
                  id="security-alerts"
                  checked={notifications.securityAlerts}
                  onCheckedChange={(value) => handleNotificationToggle('securityAlerts', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Latest VelaBuddy notifications sent to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className={`border-l-4 p-4 rounded-lg ${getNotificationColor(notification.type)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="font-medium">{notification.repo}</span>
                      <Badge variant="outline" className="text-xs">{notification.channel}</Badge>
                    </div>
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
