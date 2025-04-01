import { ActivityLog } from '@/types';

interface ActivityFeedProps {
  activities: ActivityLog[];
  isLoading?: boolean;
}

const ActivityFeed = ({ activities, isLoading = false }: ActivityFeedProps) => {
  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (activityType: string, description: string) => {
    if (activityType === 'status_update') {
      if (description.includes('critical')) return 'error';
      if (description.includes('warning') || description.includes('maintenance')) return 'engineering';
      return 'check_circle';
    }
    if (activityType === 'maintenance') return 'build';
    if (activityType === 'registration') return 'add_circle';
    return 'lightbulb';
  };

  // Function to get the appropriate color based on activity type
  const getActivityColor = (activityType: string, description: string) => {
    if (activityType === 'status_update') {
      if (description.includes('critical')) return 'text-[#E74C3C]';
      if (description.includes('warning') || description.includes('maintenance')) return 'text-[#F1C40F]';
      return 'text-[#2ECC71]';
    }
    if (activityType === 'maintenance') return 'text-[#3498DB]';
    if (activityType === 'registration') return 'text-[#3498DB]';
    return 'text-[#3498DB]';
  };

  // Function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-poppins font-medium text-textColor">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {isLoading ? (
          // Skeleton loader
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`material-icons ${getActivityColor(activity.activityType, activity.description)}`}>
                    {getActivityIcon(activity.activityType, activity.description)}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    by {activity.performedBy} • {formatRelativeTime(new Date(activity.performedAt))}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No activity recorded yet
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200">
        <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">View all activity →</a>
      </div>
    </div>
  );
};

export default ActivityFeed;
