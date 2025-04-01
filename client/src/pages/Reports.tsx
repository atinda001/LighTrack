import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LightTower, TowerStats, Filters } from '@/types';

// Import Recharts components
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar
} from 'recharts';

const Reports = () => {
  const [constituencyFilter, setConstituencyFilter] = useState<string | null>(null);
  
  // Fetch stats
  const { 
    data: stats = { active: 0, warning: 0, critical: 0, total: 0 }, 
    isLoading: isLoadingStats 
  } = useQuery<TowerStats>({
    queryKey: ['/api/stats'],
  });
  
  // Fetch towers
  const { 
    data: towers = [], 
    isLoading: isLoadingTowers 
  } = useQuery<LightTower[]>({
    queryKey: ['/api/towers'],
  });
  
  // Fetch filters
  const { 
    data: filters = { constituencies: [], wards: [] }, 
    isLoading: isLoadingFilters 
  } = useQuery<Filters>({
    queryKey: ['/api/filters'],
  });
  
  // Filter towers by constituency if selected
  const filteredTowers = constituencyFilter && constituencyFilter !== 'all'
    ? towers.filter(tower => tower.constituency === constituencyFilter)
    : towers;
  
  // Create data for status pie chart
  const statusData = [
    { name: 'Active', value: stats.active, color: '#2ECC71' },
    { name: 'Warning', value: stats.warning, color: '#F1C40F' },
    { name: 'Critical', value: stats.critical, color: '#E74C3C' },
  ];
  
  // Create data for constituency bar chart
  const constituencyData = filters.constituencies.map(constituency => {
    const towersByConstituency = towers.filter(tower => tower.constituency === constituency);
    const active = towersByConstituency.filter(tower => tower.status === 'active').length;
    const warning = towersByConstituency.filter(tower => tower.status === 'warning').length;
    const critical = towersByConstituency.filter(tower => tower.status === 'critical').length;
    
    return {
      name: constituency,
      active,
      warning,
      critical
    };
  });
  
  // Create data for maintenance history line chart (mock data as we don't have historical data)
  const currentDate = new Date();
  const maintenanceData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(currentDate.getDate() - (6 - i));
    
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      reports: Math.floor(Math.random() * 5) // Mock data for reports per day
    };
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Reports</h2>
        <p className="text-gray-600 font-roboto">View and analyze light tower statistics</p>
      </div>
      
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by Constituency:</span>
          <Select onValueChange={(value) => setConstituencyFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Constituencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Constituencies</SelectItem>
              {filters.constituencies.map(constituency => (
                <SelectItem key={constituency} value={constituency}>{constituency}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button>
          <span className="material-icons mr-2 text-sm">download</span>
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tower Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isLoadingStats ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Maintenance Reports</CardTitle>
            <CardDescription>Reports submitted over time</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={maintenanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reports" stroke="#3498DB" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Tower Summary</CardTitle>
            <CardDescription>Status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Towers:</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#2ECC71] flex items-center">
                  <span className="status-indicator status-active mr-2"></span>
                  Active:
                </span>
                <span className="font-semibold">{stats.active} ({stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#F1C40F] flex items-center">
                  <span className="status-indicator status-warning mr-2"></span>
                  Needs Attention:
                </span>
                <span className="font-semibold">{stats.warning} ({stats.total ? Math.round((stats.warning / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#E74C3C] flex items-center">
                  <span className="status-indicator status-critical mr-2"></span>
                  Critical:
                </span>
                <span className="font-semibold">{stats.critical} ({stats.total ? Math.round((stats.critical / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Verified Towers:</span>
                  <span className="font-semibold">
                    {towers.filter(t => t.verificationStatus === 'verified').length}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Pending Verification:</span>
                  <span className="font-semibold">
                    {towers.filter(t => t.verificationStatus === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status by Constituency</CardTitle>
          <CardDescription>Tower status across constituencies</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          {isLoadingTowers || isLoadingFilters ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={constituencyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" stackId="a" fill="#2ECC71" name="Active" />
                <Bar dataKey="warning" stackId="a" fill="#F1C40F" name="Needs Attention" />
                <Bar dataKey="critical" stackId="a" fill="#E74C3C" name="Critical" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
