import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import QRGenerator from '@/components/qr/QRGenerator';
import { Button } from '@/components/ui/button';
import { LightTower } from '@/types';

const GenerateQR = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  
  // Determine if the id is a numeric id or a tower ID string (LT-XXX)
  const queryKey = id?.startsWith('LT-') 
    ? ['/api/towers', id] 
    : ['/api/towers', parseInt(id || '0')];
  
  const { 
    data: tower, 
    isLoading,
    error
  } = useQuery<LightTower>({
    queryKey,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 w-64 rounded mb-2"></div>
          <div className="h-4 bg-gray-100 w-48 rounded"></div>
        </div>
        
        <QRGenerator tower={{
          id: 0,
          towerId: '',
          location: '',
          constituency: '',
          ward: '',
          status: 'active',
          verificationStatus: 'pending',
          createdAt: new Date()
        }} isLoading={true} />
      </div>
    );
  }

  if (error || !tower) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Tower Not Found</h2>
          <p className="text-gray-600 font-roboto">We couldn't find the tower you're looking for.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="mb-4">
            <span className="material-icons text-critical text-5xl">error_outline</span>
          </div>
          <h3 className="text-xl font-medium mb-2">Tower ID: {id} Not Found</h3>
          <p className="text-gray-600 mb-6">The tower you're looking for doesn't exist or may have been removed.</p>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setLocation('/register')}>
              Register New Tower
            </Button>
            <Button variant="outline" onClick={() => setLocation('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Light Tower QR Code</h2>
        <p className="text-gray-600 font-roboto">Generated QR code for light tower {tower.towerId}</p>
      </div>
      
      <QRGenerator tower={tower} />
    </div>
  );
};

export default GenerateQR;
