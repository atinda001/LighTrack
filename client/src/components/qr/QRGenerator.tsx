import { useRef } from 'react';
import { LightTower, statusColors } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface QRGeneratorProps {
  tower: LightTower;
  isLoading?: boolean;
}

const QRGenerator = ({ tower, isLoading = false }: QRGeneratorProps) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // We're using a simple CDN for QR Code generation
  // Normally we'd use a proper React QR code library
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${tower.towerId}`;

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${tower.towerId}-QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: `QR code for ${tower.towerId} has been downloaded`
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${tower.towerId}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
              }
              h2 {
                margin-bottom: 5px;
              }
              .location {
                color: #666;
                margin-bottom: 20px;
              }
              img {
                max-width: 200px;
                height: auto;
              }
              .instructions {
                text-align: left;
                margin-top: 30px;
                font-size: 12px;
              }
              .instructions ol {
                padding-left: 20px;
              }
              @media print {
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${tower.towerId}</h2>
              <p class="location">${tower.location}</p>
              <img src="${qrCodeUrl}" alt="QR Code">
              <div class="instructions">
                <h3>Instructions:</h3>
                <ol>
                  <li>Print this QR code on weather-resistant material</li>
                  <li>Affix it to the light tower at eye level</li>
                  <li>Ensure it's visible and accessible for community members</li>
                  <li>Scan the code with your phone to verify it works</li>
                </ol>
              </div>
              <button onclick="window.print(); window.close();" style="margin-top: 20px; padding: 10px; background: #3498DB; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print QR Code
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast({
        title: "Print Failed",
        description: "Unable to open print dialog. Please check your popup blocker settings.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                <div className="w-48 h-48 bg-gray-200"></div>
              </div>
              <div className="h-6 bg-gray-200 w-32 mb-2 rounded"></div>
              <div className="h-4 bg-gray-100 w-48 rounded"></div>
              <div className="mt-4 flex gap-2 justify-center">
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 w-48 mb-4 rounded"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="h-5 bg-gray-200 w-24 rounded"></div>
                    <div className="h-5 bg-gray-100 w-48 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="w-48 h-48 flex items-center justify-center" ref={qrCodeRef}>
                <img src={qrCodeUrl} alt={`QR Code for ${tower.towerId}`} className="max-w-full" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Tower ID: {tower.towerId}</h3>
              <p className="text-sm text-gray-500">{tower.location}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={handleDownload}
              >
                <span className="material-icons mr-2 text-sm">download</span>
                Download
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={handlePrint}
              >
                <span className="material-icons mr-2 text-sm">print</span>
                Print
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tower Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  <span className={`status-indicator status-${tower.status}`}></span>
                  {statusColors[tower.status].label}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {tower.lastMaintenance 
                    ? new Date(tower.lastMaintenance).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) 
                    : 'Not available'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Constituency</dt>
                <dd className="mt-1 text-sm text-gray-900">{tower.constituency}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Ward</dt>
                <dd className="mt-1 text-sm text-gray-900">{tower.ward}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{tower.notes || 'No description available'}</dd>
              </div>
            </dl>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions</h4>
              <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
                <li>Print this QR code on weather-resistant material</li>
                <li>Affix it to the light tower at eye level</li>
                <li>Ensure it's visible and accessible for community members</li>
                <li>Scan the code with your phone to verify it works</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
