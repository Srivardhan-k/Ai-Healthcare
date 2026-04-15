import { useLocation, Link } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

type SafetyStatus = "safe" | "warning" | "unsafe";

interface ResultData {
  status: SafetyStatus;
  medicine: string;
  reasons: string[];
  suggestions: string[];
  timing?: string;
  advisory?: string;
}

const API = "http://localhost:5001/api";

export function ResultScreen() {
  const location = useLocation();
  const medicineName = location.state?.medicine || "Medicine";

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkMedicine = async () => {
      try {
        const res = await fetch(`${API}/medicines/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicine: medicineName }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        // Fallback to safe default if backend is unreachable
        setError(true);
        setResult({
          status: "safe",
          medicine: medicineName,
          reasons: ["Could not reach safety database. Please check your connection."],
          suggestions: ["Consult a pharmacist or doctor directly."],
          timing: "Follow label instructions.",
          advisory: "Backend unavailable — showing offline fallback."
        });
      } finally {
        setLoading(false);
      }
    };
    checkMedicine();
  }, [medicineName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Analyzing safety profile...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const statusConfig = {
    safe: {
      bg: "bg-emerald-500", lightBg: "bg-emerald-50",
      border: "border-emerald-200", text: "text-emerald-900",
      icon: CheckCircle, label: "SAFE", description: "This medicine is safe for you",
    },
    warning: {
      bg: "bg-amber-500", lightBg: "bg-amber-50",
      border: "border-amber-200", text: "text-amber-900",
      icon: AlertTriangle, label: "WARNING", description: "Use with caution - consult your doctor",
    },
    unsafe: {
      bg: "bg-red-500", lightBg: "bg-red-50",
      border: "border-red-200", text: "text-red-900",
      icon: XCircle, label: "UNSAFE", description: "Do not take this medicine",
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/medicine-input">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Safety Result</h1>
            <p className="text-sm text-gray-500">{result.medicine}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* STATUS INDICATOR - MOST PROMINENT */}
          <Card className={`${config.bg} p-8 rounded-3xl shadow-2xl text-white text-center`}>
            <Icon className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" strokeWidth={2.5} />
            <h2 className="text-4xl font-bold mb-3 tracking-tight">{config.label}</h2>
            <p className="text-lg opacity-95 font-medium">{config.description}</p>
          </Card>

          {/* Medicine Name */}
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Checking</p>
            <h3 className="text-2xl font-semibold text-gray-900">{result.medicine}</h3>
          </div>

          {/* Reasons Section */}
          <Card className={`${config.lightBg} ${config.border} border-2 p-6 rounded-2xl`}>
            <h4 className={`${config.text} font-semibold mb-4 flex items-center gap-2`}>
              <Info className="w-5 h-5" />
              Why this result?
            </h4>
            <ul className="space-y-3">
              {result.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 ${config.bg} rounded-full mt-2 flex-shrink-0`}></div>
                  <p className={`${config.text} text-sm leading-relaxed`}>{reason}</p>
                </li>
              ))}
            </ul>
          </Card>

          {/* Suggestions Section */}
          <Card className="bg-white border-2 border-blue-100 p-6 rounded-2xl">
            <h4 className="text-blue-900 font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations
            </h4>
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
                </li>
              ))}
            </ul>

            {(result.timing || result.advisory) && (
              <div className="mt-6 pt-5 border-t border-blue-100 space-y-4">
                {result.timing && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-indigo-900">Timing Suggestion</h5>
                      <p className="text-sm text-indigo-700">{result.timing}</p>
                    </div>
                  </div>
                )}
                {result.advisory && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-amber-900">Advisory Note</h5>
                      <p className="text-sm text-amber-800">{result.advisory}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Link to="/medicine-input" className="block">
              <Button className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md text-base">
                Check Another Medicine
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full h-14 bg-white border-2 border-gray-200 rounded-xl text-base">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
