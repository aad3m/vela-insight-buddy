
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Clock, TrendingUp, AlertCircle, Award, Target } from 'lucide-react';

const successRateData = [
  { day: 'Mon', rate: 94 },
  { day: 'Tue', rate: 91 },
  { day: 'Wed', rate: 96 },
  { day: 'Thu', rate: 89 },
  { day: 'Fri', rate: 93 },
  { day: 'Sat', rate: 97 },
  { day: 'Sun', rate: 95 }
];

const deploymentData = [
  { hour: '00', deployments: 2 },
  { hour: '06', deployments: 5 },
  { hour: '09', deployments: 15 },
  { hour: '12', deployments: 22 },
  { hour: '15', deployments: 18 },
  { hour: '18', deployments: 8 },
  { hour: '21', deployments: 4 }
];

const teamMetrics = [
  {
    team: 'Frontend Team',
    members: 8,
    successRate: 96,
    avgDuration: '6.2m',
    deploysToday: 12,
    topContributor: 'sarah.chen',
    status: 'excellent'
  },
  {
    team: 'Backend Services',
    members: 12,
    successRate: 92,
    avgDuration: '8.7m',
    deploysToday: 18,
    topContributor: 'mike.rodriguez',
    status: 'good'
  },
  {
    team: 'Mobile Team',
    members: 6,
    successRate: 88,
    avgDuration: '12.4m',
    deploysToday: 6,
    topContributor: 'alex.kim',
    status: 'needs-attention'
  },
  {
    team: 'Platform/Infra',
    members: 5,
    successRate: 94,
    avgDuration: '15.1m',
    deploysToday: 4,
    topContributor: 'emma.wilson',
    status: 'good'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'excellent':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Excellent</Badge>;
    case 'good':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Good</Badge>;
    case 'needs-attention':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Needs Attention</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export const TeamMetrics = () => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4/4</div>
            <p className="text-sm text-gray-500">Teams meeting SLA</p>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Deploy Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8.4m</div>
            <p className="text-sm text-gray-500">↓ 12% from last week</p>
            <Progress value={75} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Daily Deploys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">40</div>
            <p className="text-sm text-gray-500">Across all teams today</p>
            <Progress value={85} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Success Rate Trend</CardTitle>
            <CardDescription>Weekly pipeline success rate by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={successRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[85, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Activity</CardTitle>
            <CardDescription>Hourly deployment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deploymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, 'Deployments']} />
                <Bar dataKey="deployments" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Team Performance Dashboard
          </CardTitle>
          <CardDescription>
            Detailed metrics for each engineering team at Target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMetrics.map((team) => (
              <div key={team.team} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{team.team}</h4>
                      <p className="text-sm text-gray-600">{team.members} members</p>
                    </div>
                  </div>
                  {getStatusBadge(team.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{team.successRate}%</span>
                      <Progress value={team.successRate} className="flex-1 h-2" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                    <span className="text-lg font-semibold">{team.avgDuration}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deploys Today</p>
                    <span className="text-lg font-semibold text-blue-600">{team.deploysToday}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Top Contributor</p>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-medium">{team.topContributor}</span>
                    </div>
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
