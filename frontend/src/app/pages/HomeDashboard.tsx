import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Activity, Footprints, Moon, Droplets, AlertCircle, Scan, Plus, CalendarClock, BrainCircuit, MessageCircle, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { api } from "../../api/client";

interface OverdueMedication {
  id: number;
  name: string;
  dosage: string;
  scheduled_time: string;
  minutes_overdue: number;
  severity: 'warning' | 'critical';
}

export function HomeDashboard() {
  const [dailyStats, setDailyStats] = useState({ steps: 0, sleep: 0, water: 0 });
  const [healthScore, setHealthScore] = useState(50);
  const [activeAlerts, setActiveAlerts] = useState<{ id: number; type: string; title: string; message: string; severity: string }[]>([]);
  const [overdueMeds, setOverdueMeds] = useState<OverdueMedication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fitnessRes, scoreRes, alertsRes, overdueRes] = await Promise.all([
          api.fitness.getToday(),
          api.fitness.getScore(),
          fetch(`${getBaseURL()}/alerts`),
          api.schedule.getOverdue(),
        ]);
        
        const fitness = fitnessRes.data;
        const score = scoreRes.data;
        const alerts = await alertsRes.json();
        const overdue = overdueRes.data;
        
        setDailyStats({ 
          steps: fitness?.steps || 0, 
          sleep: fitness?.sleep || 0, 
          water: fitness?.water || 0 
        });
        setHealthScore(score?.health_score || 50);
        setActiveAlerts(alerts || []);
        setOverdueMeds(overdue?.medications || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        // Backend unavailable — keep defaults silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Refresh overdue medications every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get API base URL (same as in client.ts)
  function getBaseURL(): string {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    const hostname = window.location.hostname;
    const port = 5001;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:${port}/api`;
    }
    return `http://${hostname}:${port}/api`;
  }

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { color: "bg-emerald-500", text: "Excellent", textColor: "text-emerald-700" };
    if (score >= 60) return { color: "bg-amber-500", text: "Good", textColor: "text-amber-700" };
    return { color: "bg-red-500", text: "Needs Attention", textColor: "text-red-700" };
  };

  const status = getHealthStatus(healthScore);

  const getAlertColors = (severity: string) => {
    if (severity === "danger" || severity === "error") return { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", title: "text-red-900", msg: "text-red-700" };
    return { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", title: "text-amber-900", msg: "text-amber-700" };
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">MediGuard AI</h1>
          <p className="text-sm text-gray-500">Smart Medicine Safety & Fitness</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Health Score Card */}
        <Card className="p-6 bg-white shadow-md rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">Health Score</h2>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-gray-900">{healthScore}</div>
            <div className="flex-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${status.color} rounded-full transition-all duration-500`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
              <p className={`text-sm font-medium mt-2 ${status.textColor}`}>{status.text}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-white shadow-sm rounded-xl text-center">
            <Footprints className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{dailyStats.steps.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Steps</p>
          </Card>
          <Card className="p-4 bg-white shadow-sm rounded-xl text-center">
            <Moon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{dailyStats.sleep}h</p>
            <p className="text-xs text-gray-500 mt-1">Sleep</p>
          </Card>
          <Card className="p-4 bg-white shadow-sm rounded-xl text-center">
            <Droplets className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{dailyStats.water}L</p>
            <p className="text-xs text-gray-500 mt-1">Water</p>
          </Card>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3 pt-4">
          <Link to="/medicine-input" className="block">
            <Button className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md text-base">
              <Scan className="w-5 h-5 mr-2" />
              Scan Medicine
            </Button>
          </Link>
          <Link to="/medicine-input" className="block">
            <Button className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl shadow-sm text-base">
              <Plus className="w-5 h-5 mr-2" />
              Enter Medicine
            </Button>
          </Link>
        </div>

        {/* Alerts Section */}
        <div className="space-y-3">
          {/* Overdue Medications Alerts */}
          {overdueMeds.length > 0 && (
            <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-1">Overdue Medications</h3>
                  <p className="text-sm text-red-700">You have {overdueMeds.length} medication(s) past due time</p>
                </div>
              </div>
              <div className="space-y-2 ml-8">
                {overdueMeds.map(med => (
                  <div key={med.id} className="text-sm">
                    <p className="font-medium text-red-900">{med.name} ({med.dosage})</p>
                    <p className="text-red-700 text-xs">
                      Scheduled: {med.scheduled_time} • {med.minutes_overdue} minute{med.minutes_overdue !== 1 ? 's' : ''} late
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/scheduler" className="block mt-3">
                <Button className="w-full h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                  Take Now
                </Button>
              </Link>
            </Card>
          )}

          {activeAlerts.map(alert => {
            const c = getAlertColors(alert.severity);
            return (
              <Card key={alert.id} className={`p-4 ${c.bg} border ${c.border} rounded-xl`}>
                <div className="flex gap-3">
                  <AlertCircle className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} />
                  <div>
                    <h3 className={`font-medium ${c.title} mb-1`}>{alert.title}</h3>
                    <p className={`text-sm ${c.msg}`}>{alert.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>


        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-6 py-3">
            <div className="flex justify-between items-center px-2">
              <Link to="/" className="flex flex-col items-center gap-1 text-blue-500">
                <Activity className="w-6 h-6" />
                <span className="text-[10px] sm:text-xs font-medium">Home</span>
              </Link>
              <Link to="/scheduler" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <CalendarClock className="w-6 h-6" />
                <span className="text-[10px] sm:text-xs font-medium">Schedule</span>
              </Link>
              <Link to="/chat" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <MessageCircle className="w-6 h-6" />
                <span className="text-[10px] sm:text-xs font-medium">Chat</span>
              </Link>
              <Link to="/risk-prediction" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <BrainCircuit className="w-6 h-6" />
                <span className="text-[10px] sm:text-xs font-medium">AI Risk</span>
              </Link>
              <Link to="/fitness" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <Footprints className="w-6 h-6" />
                <span className="text-[10px] sm:text-xs font-medium">Fitness</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <User className="w-6 h-6" />
                <span className="text-[10px] sm:text-xs font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
