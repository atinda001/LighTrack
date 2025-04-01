import { TowerStats } from '@/types';

interface StatusSummaryProps {
  stats: TowerStats;
  isLoading?: boolean;
}

const StatusSummary = ({ stats, isLoading = false }: StatusSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-roboto">Active Towers</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-poppins font-semibold text-[#2ECC71]">{stats.active}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2ECC71] bg-opacity-10 flex items-center justify-center">
            <span className="material-icons text-[#2ECC71]">check_circle</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-roboto">Needs Attention</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-poppins font-semibold text-[#F1C40F]">{stats.warning}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F1C40F] bg-opacity-10 flex items-center justify-center">
            <span className="material-icons text-[#F1C40F]">engineering</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-roboto">Critical Issues</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-poppins font-semibold text-[#E74C3C]">{stats.critical}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E74C3C] bg-opacity-10 flex items-center justify-center">
            <span className="material-icons text-[#E74C3C]">error</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusSummary;
