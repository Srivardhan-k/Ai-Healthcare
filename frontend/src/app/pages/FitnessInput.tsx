import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Footprints, Moon, Droplets, Save, Activity, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";

export function FitnessInput() {
  const [steps, setSteps] = useState("8234");
  const [sleep, setSleep] = useState("7.5");
  const [water, setWater] = useState("2.1");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                liters
              </span>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className={`w-full h-14 rounded-xl shadow-md text-base transition-all ${
              saved
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {saved ? (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Data
              </>
            )}
          </Button>

          {/* Tips */}
          <Card className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-medium text-blue-900 mb-2">Daily Tips</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Aim for 10,000 steps daily for optimal health</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Quality sleep improves medication effectiveness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Stay hydrated, especially when taking medicine</span>
              </li>
            </ul>
          </Card>

          {/* Historical Data */}
          <div className="pt-6 mt-8 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              Past 7 Days
            </h3>
            <div className="space-y-3">
              {[
                { day: "Tue", date: "Apr 14", steps: "10,210", sleep: "8.0", water: "2.5" },
                { day: "Mon", date: "Apr 13", steps: "7,840", sleep: "6.5", water: "1.8" },
                { day: "Sun", date: "Apr 12", steps: "12,500", sleep: "9.0", water: "3.0" },
                { day: "Sat", date: "Apr 11", steps: "11,200", sleep: "7.5", water: "2.8" },
              ].map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="flex flex-col w-12 text-center">
                    <span className="font-semibold text-gray-900 text-sm">{record.day}</span>
                    <span className="text-xs text-gray-500">{record.date}</span>
                  </div>
                  <div className="flex-1 flex justify-around ml-2 border-l border-gray-100 pl-4 py-1">
                     <span className="text-xs font-medium text-gray-600 flex flex-col items-center"><Footprints className="w-4 h-4 text-blue-400 mb-1"/> {record.steps}</span>
                     <span className="text-xs font-medium text-gray-600 flex flex-col items-center"><Moon className="w-4 h-4 text-indigo-400 mb-1"/> {record.sleep}h</span>
                     <span className="text-xs font-medium text-gray-600 flex flex-col items-center"><Droplets className="w-4 h-4 text-cyan-400 mb-1"/> {record.water}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
