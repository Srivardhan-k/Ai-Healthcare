import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Camera, Search, X, Loader2, ScanLine } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import Tesseract from "tesseract.js";

export function MedicineInput() {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCheckSafety = () => {
    if (medicineName.trim()) {
      navigate("/result", { state: { medicine: medicineName } });
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setIsScanning(true);
    setScanResult("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      alert("Failed to access camera. Please check permissions!");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Capture Frame & Run OCR
  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("No valid camera frame detected! Cannot perform OCR without an active local video feed.");
      setIsProcessing(false);
      stopCamera();
      return;
    }
    
    // Draw current video frame to hidden canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Run Tesseract Optical Character Recognition
    try {
      const result = await Tesseract.recognize(canvas, 'eng', {
        logger: m => console.log(m) // Optional progress logger
      });
      
      const extractedText = result.data.text.trim();
      setScanResult(extractedText);
      console.log("OCR Extracted:", extractedText);

      // Simple heuristic: Try to find the longest block of alpha letters which might be the medicine name
      const words = extractedText.replace(/[^a-zA-Z\s]/g, "").split(/\s+/);
      const longestWord = words.reduce((a, b) => a.length > b.length ? a : b, "");
      
      if (longestWord.length > 3) {
        setMedicineName(longestWord.charAt(0).toUpperCase() + longestWord.slice(1).toLowerCase());
      } else if (extractedText) {
        // Fallback to first line
        setMedicineName(extractedText.split('\n')[0]);
      }
      
    } catch (err) {
      console.error("OCR Extraction failed", err);
      alert("Failed to read text. Please try again or type manually.");
    } finally {
      setIsProcessing(false);
      stopCamera();
    }
  };

  // Ensure camera stops cleanly if user unmounts/navigates away
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Check Medicine</h1>
            <p className="text-sm text-gray-500">Enter or scan to verify safety</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="space-y-8">
          
          {/* Scan Option */}
          <div className="text-center">
            <Button
              onClick={startCamera}
              size="lg"
              className="w-32 h-32 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-xl flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <ScanLine className="w-12 h-12" />
            </Button>
            <p className="text-sm text-gray-600 mt-4 font-medium">Scan Medicine Label (OCR)</p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">or type manually</span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="medicine" className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="medicine"
                  type="text"
                  placeholder="e.g., Aspirin, Lisinopril..."
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleCheckSafety();
                  }}
                />
              </div>
            </div>

            <Button
              onClick={handleCheckSafety}
              disabled={!medicineName.trim()}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md text-base disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Check Safety Output
            </Button>
          </div>
          
          {/* Recent Searches */}
          <div className="pt-6 border-t border-gray-100">
             <h3 className="text-sm font-medium text-gray-600 mb-3">Popular Checks</h3>
             <div className="flex gap-2 flex-wrap">
               {["Ibuprofen", "Lisinopril", "Amoxicillin"].map(m => (
                 <span key={m} onClick={() => setMedicineName(m)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100">
                    {m}
                 </span>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Full-Screen Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col pt-safe">
           {/* Top bar */}
           <div className="absolute top-0 inset-x-0 p-4 flex justify-end z-10 bg-gradient-to-b from-black/60 to-transparent">
             <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={stopCamera}>
               <X className="w-8 h-8" />
             </Button>
           </div>
           
           {/* Video Feed */}
           <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="h-full w-full object-cover"
             />
             {/* Scanner Overlay UI */}
             <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-32 border-4 border-blue-400 rounded-xl relative shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                   <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                   <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                   <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
             </div>
           </div>

           {/* Bottom Bar Action Engine */}
           <div className="h-32 bg-black pb-safe flex items-center justify-center p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <Button 
                 onClick={captureAndScan}
                 disabled={isProcessing}
                 className="w-20 h-20 rounded-full border-4 border-blue-500 bg-white hover:bg-gray-200 transition-all shadow-xl flex items-center justify-center relative overflow-hidden"
              >
                 {isProcessing ? (
                   <div className="absolute inset-0 bg-blue-500 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                   </div>
                 ) : (
                   <span className="sr-only">Capture Frame</span>
                 )}
              </Button>
           </div>
           {isProcessing && (
              <div className="absolute bottom-32 left-0 right-0 text-center">
                 <p className="text-white font-medium bg-black/50 inline-block px-4 py-2 rounded-full">
                    Extracting Medical Name via OCR...
                 </p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
