import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Footprints, Moon, Droplets, Save, Activity, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { api } from "../../api/client";

export function FitnessInput() {
  const [steps, setSteps] = useState("0");
  const [sleep, setSleep] = useState("0");
  const [water, setWater] = useState("0");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fitnessData');
      if (saved) {
        const data = JSON.parse(saved);
        setSteps(data.steps || "0");
        setSleep(data.sleep || "0");
        setWater(data.water || "0");
      }
    } catch (err) {
      console.error('Failed to load fitness data from storage:', err);
    }
  }, []);

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('fitnessData', JSON.stringify({
        steps: steps || "0",
        sleep: sleep || "0",
        water: water || "0",
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to save fitness data to storage:', err);
    }
  }, [steps, sleep, water]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const stepsNum = parseInt(steps) || 0;
      const sleepNum = parseFloat(sleep) || 0;
      const waterNum = parseFloat(water) || 0;

      const result = await api.fitness.saveData(stepsNum, sleepNum, waterNum);
      
      if (result.error) {
        console.warn('API save failed, using localStorage:', result.error);
        // Still consider it success since we have localStorage backup
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save fitness data:', err);
      setError('Failed to sync with server, but data is saved locally');
      // Reset error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Fitness Data</h1>
            <p className="text-sm text-gray-500">Track your daily activity</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Today's Summary */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Today's Activity</h2>
            <p className="text-sm text-gray-500">Wednesday, April 15, 2026</p>
          </div>

          {/* Steps Card */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Footprints className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Steps</h3>
                <p className="text-xs text-gray-500">Daily goal: 10,000</p>
              </div>
            </div>
            <Input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="h-12 text-lg rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0"
              inputMode="numeric"
            />
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((parseInt(steps) / 10000) * 100, 100)}%` }}
              ></div>
            </div>
          </Card>

          {/* Sleep Card */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sleep</h3>
                <p className="text-xs text-gray-500">Recommended: 7-9 hours</p>
              </div>
            </div>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="h-12 text-lg rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0"
                inputMode="decimal"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                hours
              </span>
            </div>
          </Card>

          {/* Water Card */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Water Intake</h3>
                <p className="text-xs text-gray-500">Target: 2-3 liters</p>
              </div>
            </div>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="h-12 text-lg rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="0"
                inputMode="decimal"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                liters
              </span>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full h-14 rounded-xl shadow-md text-base transition-all touch-action-manipulation ${
              saved
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Fitness Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
