import QRScanner from '@/components/qr/QRScanner';

const ScanQR = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Scan QR Code</h2>
        <p className="text-gray-600 font-roboto">Scan a light tower QR code to view details or report issues</p>
      </div>

      <QRScanner />
    </div>
  );
};

export default ScanQR;
