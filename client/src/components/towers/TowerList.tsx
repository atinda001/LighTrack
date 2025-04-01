import { useState } from 'react';
import { Link } from 'wouter';
import { LightTower, statusColors } from '@/types';

interface TowerListProps {
  towers: LightTower[];
  isLoading?: boolean;
  onStatusFilterChange?: (status: string | null) => void;
  onConstituencyFilterChange?: (constituency: string | null) => void;
  onWardFilterChange?: (ward: string | null) => void;
  constituencies: string[];
  wards: string[];
}

const TowerList = ({ 
  towers, 
  isLoading = false,
  onStatusFilterChange,
  onConstituencyFilterChange,
  onWardFilterChange,
  constituencies,
  wards
}: TowerListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter towers based on search term
  const filteredTowers = towers.filter(tower => 
    tower.towerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tower.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tower.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tower.ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredTowers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTowers = filteredTowers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h3 className="text-lg font-poppins font-medium text-textColor">Light Towers</h3>
        
        <div className="flex flex-wrap gap-2">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
            onChange={(e) => onConstituencyFilterChange?.(e.target.value || null)}
          >
            <option value="">All Constituencies</option>
            {constituencies.map(constituency => (
              <option key={constituency} value={constituency}>{constituency}</option>
            ))}
          </select>
          
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
            onChange={(e) => onWardFilterChange?.(e.target.value || null)}
          >
            <option value="">All Wards</option>
            {wards.map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
          
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
            onChange={(e) => onStatusFilterChange?.(e.target.value || null)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="warning">Needs Attention</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="relative w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search towers..." 
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-icons absolute left-2 top-2 text-gray-400 text-sm">search</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="animate-pulse p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 mb-2 rounded"></div>
            ))}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTowers.length > 0 ? (
                currentTowers.map(tower => (
                  <tr key={tower.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tower.towerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tower.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[tower.status].bg} ${statusColors[tower.status].text}`}>
                        <span className={`status-indicator status-${tower.status}`}></span>
                        {statusColors[tower.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tower.lastMaintenance ? new Date(tower.lastMaintenance).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/generate/${tower.id}`}>
                        <a className="text-primary hover:text-primary-dark">View</a>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No towers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button 
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredTowers.length)}
                  </span> of <span className="font-medium">{filteredTowers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <span className="material-icons text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TowerList;
