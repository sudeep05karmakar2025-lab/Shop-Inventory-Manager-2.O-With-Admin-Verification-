import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState("");

  useEffect(() => {
    // using Html5QrcodeScanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // ignore verbose scan errors during scanning
      }
    );

    return () => {
      scanner.clear().catch((e) => console.error("Failed to clear scanner", e));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Camera className="w-5 h-5 mr-2 text-indigo-600" />
            Scan QR Code
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wider mb-2">{error}</p>}
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden border-2 border-slate-100"></div>
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mt-6">
            Point your camera at a QR code
          </p>
        </div>
      </div>
    </div>
  );
}
