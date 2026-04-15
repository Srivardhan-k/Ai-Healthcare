import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Camera, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export function MedicineInput() {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");

  const handleCheckSafety = () => {
    if (medicineName.trim()) {
      // Pass medicine name to result screen via URL state
      navigate("/result", { state: { medicine: medicineName } });
    }
  };

  const handleScan = () => {
    // In a real app, this would trigger camera
    alert("Camera scan feature would open here");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
              onClick={handleScan}
              size="lg"
              className="w-32 h-32 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-xl"
            >
              <Camera className="w-12 h-12" />
            </Button>
            <p className="text-sm text-gray-600 mt-4 font-medium">Scan Medicine Label</p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">or</span>
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
                  placeholder="e.g., Aspirin, Paracetamol"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCheckSafety();
                    }
                  }}
                />
              </div>
            </div>

            <Button
              onClick={handleCheckSafety}
              disabled={!medicineName.trim()}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Check Safety
            </Button>
          </div>

          {/* Recent Searches */}
          <div className="pt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h3>
            <div className="space-y-2">
              {["Aspirin", "Paracetamol", "Ibuprofen"].map((med) => (
                <button
                  key={med}
                  onClick={() => setMedicineName(med)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {med}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
