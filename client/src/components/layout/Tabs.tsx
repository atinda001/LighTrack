import { Link, useLocation } from 'wouter';

const Tabs = () => {
  const [location] = useLocation();

  const tabs = [
    { name: 'Dashboard', path: '/' },
    { name: 'Register Tower', path: '/register' },
    { name: 'Scan QR Code', path: '/scan' },
    { name: 'Reports', path: '/reports' },
    { name: 'Admin Panel', path: '/admin' }
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 overflow-x-auto py-2 scrollbar-hide" aria-label="Tabs">
          {tabs.map(tab => (
            <Link key={tab.path} href={tab.path}>
              <a 
                className={`px-3 py-2 text-sm font-medium ${
                  location === tab.path
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
