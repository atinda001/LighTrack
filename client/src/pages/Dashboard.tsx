import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatusSummary from '@/components/towers/StatusSummary';
import TowerMap from '@/components/map/TowerMap';
import TowerList from '@/components/towers/TowerList';
import ActivityFeed from '@/components/towers/ActivityFeed';
import QuickActions from '@/components/towers/QuickActions';
import { LightTower, TowerStats, ActivityLog, Filters } from '@/types';

const Dashboard = () => {
  const [selectedTower, setSelectedTower] = useState<LightTower | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [constituencyFilter, setConstituencyFilter] = useState<string | null>(null);
  const [wardFilter, setWardFilter] = useState<string | null>(null);
  
  // Fetch towers
  const { 
    data: towers = [], 
    isLoading: isLoadingTowers 
  } = useQuery<LightTower[]>({
    queryKey: ['/api/towers'],
  });
  
  // Fetch stats
  const { 
    data: stats = { active: 0, warning: 0, critical: 0, total: 0 }, 
    isLoading: isLoadingStats 
  } = useQuery<TowerStats>({
    queryKey: ['/api/stats'],
  });
  
  // Fetch activity logs
  const { 
    data: activities = [], 
    isLoading: isLoadingActivities 
  } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activity'],
  });
  
  // Fetch filters (constituencies and wards)
  const { 
    data: filters = { constituencies: [], wards: [] }, 
    isLoading: isLoadingFilters 
  } = useQuery<Filters>({
    queryKey: ['/api/filters'],
  });
  
  // Filter towers based on selected filters
  const filteredTowers = towers.filter(tower => {
    if (statusFilter && tower.status !== statusFilter) return false;
    if (constituencyFilter && tower.constituency !== constituencyFilter) return false;
    if (wardFilter && tower.ward !== wardFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Light Tower Dashboard</h2>
        <p className="text-gray-600 font-roboto">Monitor and manage light towers across Nairobi County</p>
      </div>
      
      {/* Status Summary */}
      <StatusSummary stats={stats} isLoading={isLoadingStats} />
      
      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-poppins font-medium text-textColor">Light Towers Map</h3>
          </div>
        </div>
        
        <TowerMap 
          towers={filteredTowers} 
          selectedTower={selectedTower} 
          onTowerSelect={setSelectedTower} 
        />
      </div>
      
      {/* Tower List and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tower List */}
        <div className="lg:col-span-2">
          <TowerList 
            towers={filteredTowers} 
            isLoading={isLoadingTowers}
            onStatusFilterChange={setStatusFilter}
            onConstituencyFilterChange={setConstituencyFilter}
            onWardFilterChange={setWardFilter}
            constituencies={filters.constituencies}
            wards={filters.wards}
          />
        </div>
        
        {/* Activity & Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <ActivityFeed activities={activities} isLoading={isLoadingActivities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
