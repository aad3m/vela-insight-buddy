
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Clock, TrendingUp, AlertCircle, Award, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface TeamMetric {
  team: string;
  members: number;
  successRate: number;
  avgDuration: string;
  deploysToday: number;
  topContributor: string;
  status: string;
}

interface UserProfile {
  team: string | null;
  full_name: string | null;
}

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [userTeams, setUserTeams] = useState<TeamMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTeams = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, get the user's profile to find their team
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      if (!profile?.team) {
        // User doesn't have a team assigned
        setUserTeams([]);
        setLoading(false);
        return;
      }

      // Get all team members for the user's team
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('profiles')
        .select('full_name, team')
        .eq('team', profile.team);

      if (teamMembersError) {
        console.error('Error fetching team members:', teamMembersError);
        throw teamMembersError;
      }

      // Get pipeline data for the team (this would need team association in pipelines table)
      // For now, we'll calculate mock metrics based on the team
      const teamMetrics = calculateTeamMetrics(profile.team, teamMembers || []);
      setUserTeams([teamMetrics]);

    } catch (err: any) {
      console.error('Error in fetchUserTeams:', err);
      setError(err.message || 'Failed to load team metrics');
      toast({
        title: "Error loading team metrics",
        description: "There was a problem fetching your team data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamMetrics = (teamName: string, members: any[]): TeamMetric => {
    // Calculate metrics based on team data
    // In a real implementation, this would aggregate pipeline data
    const memberCount = members.length;
    const topContributor = members.find(m => m.full_name)?.full_name || 'Unknown';
    
    // Generate team-specific metrics (these would come from actual pipeline data)
    const successRate = Math.floor(Math.random() * 10) + 88; // 88-98%
    const avgDurationMins = Math.floor(Math.random() * 10) + 5; // 5-15 mins
    const deploysToday = Math.floor(Math.random() * 20) + 5; // 5-25 deploys
    
    let status = 'good';
    if (successRate >= 95) status = 'excellent';
    else if (successRate < 90) status = 'needs-attention';

    return {
      team: teamName,
      members: memberCount,
      successRate,
      avgDuration: `${avgDurationMins}.${Math.floor(Math.random() * 9)}m`,
      deploysToday,
      topContributor,
      status
    };
  };

  useEffect(() => {
    fetchUserTeams();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Team Metrics</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchUserTeams}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userTeams.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Assigned</h3>
              <p className="text-gray-600">
                You don't have a team assigned to your profile yet. Contact your administrator to join a team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Your Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userTeams.length}/1</div>
            <p className="text-sm text-gray-500">Team meeting SLA</p>
            <Progress value={userTeams[0]?.successRate || 0} className="mt-2 h-2" />
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
            <div className="text-2xl font-bold text-green-600">{userTeams[0]?.avgDuration || 'N/A'}</div>
            <p className="text-sm text-gray-500">Your team average</p>
            <Progress value={75} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Team Deploys Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{userTeams[0]?.deploysToday || 0}</div>
            <p className="text-sm text-gray-500">Across your team</p>
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
            Your Team Performance
          </CardTitle>
          <CardDescription>
            Detailed metrics for your engineering team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userTeams.map((team) => (
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
