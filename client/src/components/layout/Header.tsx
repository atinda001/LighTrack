import { useState } from 'react';
import { Link } from 'wouter';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">lightbulb</span>
            <Link href="/">
              <a className="text-xl font-poppins font-semibold text-textColor">
                Light Tower Management System
              </a>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-roboto">Nairobi County</span>
            <Link href="/admin">
              <a className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                Admin Login
              </a>
            </Link>
          </div>
          
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-icons">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden py-2 pb-4">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-600 font-roboto">Nairobi County</span>
              <Link href="/admin">
                <a className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 w-full text-center">
                  Admin Login
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
