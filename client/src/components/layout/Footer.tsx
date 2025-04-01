import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="/about">
              <a className="text-gray-400 hover:text-gray-500">About</a>
            </Link>
            <Link href="/help">
              <a className="text-gray-400 hover:text-gray-500">Help</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-gray-500">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-400 hover:text-gray-500">Terms</a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center md:text-right text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Light Tower Management System - Nairobi County
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
