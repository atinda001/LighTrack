import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { LightTower } from '../../types';
import MaintenanceUpdateForm from '@/components/towers/MaintenanceUpdateForm';

// Import the HTML5 QR code scanner
// This is loaded via CDN in index.html
declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

interface RecentScan {
  towerId: string;
  location: string;
  timestamp: Date;
}

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scannedTowerId, setScannedTowerId] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Query for tower data after scanning
  const { data: scannedTower, isLoading: isLoadingTower } = useQuery({
    queryKey: ['/api/towers', scannedTowerId],
    queryFn: async () => {
      if (!scannedTowerId) return null;
      const response = await fetch(`/api/towers/${scannedTowerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Tower not found",
            description: `No tower with ID ${scannedTowerId} found in the system.`,
            variant: "destructive"
          });
          return null;
        }
        throw new Error('Failed to fetch tower data');
      }
      return response.json();
    },
    enabled: !!scannedTowerId,
  });

  // Load the scanner library
  useEffect(() => {
    if (!window.Html5Qrcode && !document.getElementById('html5-qr-script')) {
      const script = document.createElement('script');
      script.id = 'html5-qr-script';
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Load sample recent scans
    const sampleScans: RecentScan[] = [
      { towerId: 'LT-002', location: 'Langata, Madaraka Estate', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { towerId: 'LT-007', location: 'Westlands, Waiyaki Way', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ];
    setRecentScans(sampleScans);

    // Cleanup function
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!window.Html5Qrcode) {
        toast({
          title: "Scanner not loaded",
          description: "Please try again in a moment",
          variant: "destructive"
        });
        return;
      }

      if (!qrBoxRef.current) return;

      try {
        // Request camera permission
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
      } catch (error) {
        setCameraPermission(false);
        toast({
          title: "Camera access denied",
          description: "Please enable camera access to scan QR codes",
          variant: "destructive"
        });
        return;
      }

      scannerRef.current = new window.Html5Qrcode("qr-reader");
      
      const boxWidth = qrBoxRef.current.clientWidth;
      const boxHeight = qrBoxRef.current.clientHeight;
      const config = { fps: 10, qrbox: { width: boxWidth * 0.7, height: boxHeight * 0.7 } };
      
      await scannerRef.current.start(
        { facingMode: "environment" }, 
        config,
        onScanSuccess,
        onScanFailure
      );
      
      setScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast({
        title: "Scanner error",
        description: "Failed to start the QR code scanner",
        variant: "destructive"
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = (decodedText: string) => {
    stopScanner();
    
    // Check if it's a valid tower ID format (LT-XXX)
    if (decodedText.startsWith('LT-')) {
      toast({
        title: "QR Code Scanned",
        description: `Tower ID: ${decodedText}`,
      });
      
      // Set the scanned tower ID to load tower data
      setScannedTowerId(decodedText);
      
      // Add to recent scans
      const now = new Date();
      setRecentScans(prev => [
        { towerId: decodedText, location: 'Loading...', timestamp: now },
        ...prev.slice(0, 4) // Keep only the 5 most recent
      ]);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not a valid tower ID",
        variant: "destructive"
      });
      
      // Restart scanner after invalid scan
      setTimeout(() => startScanner(), 1000);
    }
  };
  
  // Reset scan
  const resetScan = () => {
    setScannedTowerId(null);
    startScanner();
  };

  const onScanFailure = (error: any) => {
    // We don't need to do anything here as it's called frequently when no QR code is detected
    // console.error("QR scan error:", error);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (scannerRef.current) {
        scannerRef.current.clear();
        
        scannerRef.current.scanFile(e.target.files[0], true)
          .then((decodedText: string) => {
            onScanSuccess(decodedText);
          })
          .catch((error: any) => {
            toast({
              title: "Failed to scan QR code",
              description: "The uploaded image does not contain a valid QR code",
              variant: "destructive"
            });
          });
      }
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return 'yesterday';
    }
  };

  // Handle form submission success
  const handleMaintenanceSuccess = () => {
    toast({
      title: "Maintenance Report Submitted",
      description: "Thank you for updating the tower status!",
    });
    
    // Reset the scanner to scan another tower
    resetScan();
  };

  // Handle manual tower ID entry
  const handleManualEntry = () => {
    const towerId = prompt("Enter Tower ID (e.g., LT-001):");
    if (towerId && towerId.startsWith('LT-')) {
      setScannedTowerId(towerId);
    } else if (towerId) {
      toast({
        title: "Invalid Tower ID",
        description: "Tower ID must be in the format LT-XXX",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Show maintenance form when a tower is scanned, otherwise show scanner */}
      {scannedTower ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-poppins font-medium text-textColor">Tower {scannedTower.towerId} Maintenance</h3>
            <button 
              onClick={resetScan}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <span className="material-icons mr-1 text-sm">arrow_back</span>
              Back to Scanner
            </button>
          </div>
          <div className="p-6">
            <MaintenanceUpdateForm 
              tower={scannedTower} 
              onSuccess={handleMaintenanceSuccess} 
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-poppins font-medium text-textColor">Scanner</h3>
            </div>
            <div className="p-6">
              <div 
                ref={qrBoxRef} 
                id="qr-reader" 
                className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg mb-4"
                style={{ height: '250px' }}
              >
                {!scanning && !isLoadingTower && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <span className="material-icons text-4xl text-gray-400">qr_code_scanner</span>
                      <p className="text-gray-500 mt-2">Camera preview will appear here</p>
                      <button 
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        onClick={startScanner}
                        disabled={cameraPermission === false}
                      >
                        Start Camera
                      </button>
                    </div>
                  </div>
                )}
                
                {isLoadingTower && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <span className="material-icons text-4xl text-primary animate-pulse">search</span>
                      <p className="text-gray-500 mt-2">Looking up tower information...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">Position the QR code within the camera frame to scan automatically</p>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer">
                  <span className="material-icons mr-2 text-sm">photo_library</span>
                  Upload QR Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={handleManualEntry}
                >
                  <span className="material-icons mr-2 text-sm">input</span>
                  Enter Tower ID
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-poppins font-medium text-textColor">Recently Scanned</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {recentScans.length > 0 ? (
                recentScans.map((scan, index) => (
                  <div 
                    key={index} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setScannedTowerId(scan.towerId)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="material-icons text-primary">lightbulb</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Tower {scan.towerId}</p>
                        <p className="text-xs text-gray-500">{scan.location} • Scanned {formatRelativeTime(scan.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No recent scans
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
