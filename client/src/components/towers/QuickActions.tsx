import { Link } from 'wouter';

const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-poppins font-medium text-textColor">Quick Actions</h3>
      </div>
      <div className="p-4 space-y-4">
        <Link href="/register">
          <a className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span className="material-icons mr-2 text-sm">add_circle</span>
            Register New Tower
          </a>
        </Link>
        <Link href="/scan">
          <a className="w-full flex items-center justify-center px-4 py-2 border border-primary rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span className="material-icons mr-2 text-sm">qr_code_scanner</span>
            Scan QR Code
          </a>
        </Link>
        <Link href="/reports">
          <a className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span className="material-icons mr-2 text-sm">assessment</span>
            Generate Report
          </a>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
