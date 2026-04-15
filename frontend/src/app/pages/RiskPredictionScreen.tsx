import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BrainCircuit, Activity, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";

const API = "http://localhost:5001/api";

export function RiskPredictionScreen() {
  const [age, setAge] = useState("28");
  const [bmi, setBmi] = useState("22.7");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<{risk: number, level: string, expl: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API}/risk/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age: Number(age), bmi: Number(bmi), symptoms }),
      });
      const data = await res.json();
      setResult({ risk: data.risk, level: data.level, expl: data.expl });
    } catch {
      // Offline fallback
      const calcRisk = Math.min(15 + (Number(age) > 50 ? 20 : 0) + (Number(bmi) > 25 ? 15 : 0), 99);
      setResult({ risk: calcRisk, level: calcRisk > 40 ? "Moderate Risk" : "Low Risk", expl: "Offline estimate. Connect to backend for full analysis." });
    } finally {
      setIsAnalyzing(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Risk Analysis</h1>
              <p className="text-sm text-gray-500">Predictive health insights</p>
            </div>
          </div>
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        
        {!result ? (
          <>
            <Card className="p-6 bg-white shadow-md rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-indigo-500" /> Vitals & Symptoms
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <Input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BMI</label>
                    <Input
                      type="number"
                      value={bmi}
                      onChange={(e) => setBmi(e.target.value)}
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Symptoms</label>
                  <Textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe any pain, fatigue, or unusual feelings..."
                    className="min-h-24 rounded-xl border-gray-200"
                  />
                </div>
              </div>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md text-base"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 animate-pulse" /> Analyzing Data...
                </span>
              ) : (
                "Generate Risk Prediction"
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <Card className={`p-8 text-white text-center rounded-3xl shadow-xl ${result.risk > 70 ? 'bg-red-500' : result.risk > 40 ? 'bg-amber-500' : 'bg-indigo-500'}`}>
              <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-6xl font-bold mb-2">{result.risk}<span className="text-3xl opacity-75">%</span></h2>
              <p className="text-lg font-medium opacity-90">{result.level}</p>
            </Card>

            <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-gray-500" /> Explanation
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.expl}
              </p>
            </Card>

            <Button
              onClick={() => setResult(null)}
              variant="outline"
              className="w-full h-14 bg-white border-2 border-gray-200 rounded-xl text-base"
            >
              Re-evaluate
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
