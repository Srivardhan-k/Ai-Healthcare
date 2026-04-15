import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Calendar, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const API = "http://localhost:5001/api";

interface MedicationTask {
  id: number;
  name: string;
  time: string;
  taken: boolean;
  dosage: string;
  date: string;
}

export function SchedulerScreen() {
  const [medications, setMedications] = useState<MedicationTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${API}/scheduler/today`);
        const data = await res.json();
        setMedications(data);
      } catch {
        // Fallback if backend unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const toggleTaken = async (id: number) => {
    try {
      const res = await fetch(`${API}/scheduler/${id}/taken`, { method: "PATCH" });
      const data = await res.json();
      setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: data.taken } : m));
    } catch {
      // Optimistic update if offline
      setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
    }
  };

  const missedCount = medications.filter(m => !m.taken).length;



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
              <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>
              <p className="text-sm text-gray-500">Your daily medications</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Calendar className="w-5 h-5 text-blue-500" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Missed Dose Alert */}
          {missedCount > 0 && (
            <Card className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Missed Medication!</h3>
                <p className="text-sm text-red-700 mt-1">
                  You have {missedCount} medication(s) past due. Taking them immediately or reviewing is critical. An emergency alert might trigger if ignored longer.
                </p>
              </div>
            </Card>
          )}

          {/* Date Selector Header */}
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Today's Plan
            </h2>
            <Button variant="ghost" className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3">
              <Plus className="w-4 h-4 mr-1"/> Add New
            </Button>
          </div>

          {/* Timeline List */}
          <div className="space-y-4">
            {medications.map((med) => {
              const showWarning = !med.taken;
              
              return (
                <Card 
                  key={med.id} 
                  className={`p-4 rounded-2xl shadow-sm border-2 transition-all cursor-pointer ${
                    med.taken 
                      ? "bg-gray-50 border-gray-100 opacity-70" 
                      : showWarning 
                        ? "bg-white border-red-300 shadow-red-100" 
                        : "bg-white border-transparent hover:border-blue-100"
                  }`}
                  onClick={() => toggleTaken(med.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Time Column */}
                    <div className="flex flex-col items-center justify-center min-w-[70px]">
                      <span className={`text-sm font-bold ${showWarning ? 'text-red-600' : 'text-gray-900'}`}>
                        {med.time.split(" ")[0]}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {med.time.split(" ")[1]}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className={`w-0.5 h-10 ${showWarning ? 'bg-red-200' : 'bg-gray-200'} rounded-full`}></div>

                    {/* Details Column */}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-base ${med.taken ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {med.name}
                      </h3>
                      <p className="text-sm text-gray-500">{med.dosage}</p>
                    </div>

                    {/* Action Column */}
                    <div className="flex-shrink-0">
                      {med.taken ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full border-2 ${showWarning ? 'border-red-400 bg-red-50' : 'border-gray-300'} flex items-center justify-center`}>
                          {showWarning && <span className="w-3 h-3 bg-red-500 rounded-full"></span>}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-400 pt-4">
            Tap a card to mark medication as taken.
          </p>

        </div>
      </div>
    </div>
  );
}
