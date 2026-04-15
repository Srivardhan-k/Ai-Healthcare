import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, User, Calendar, AlertCircle, Stethoscope, Save, Edit2, Phone, Mail, Plus, X, Calculator } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";

export function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    age: "28",
    height: "165",
    weight: "62",
    allergies: "Penicillin, Peanuts",
    conditions: "Mild Asthma, Hypertension",
    currentMeds: ["Lisinopril 10mg daily"],
    emergencyPhone: "",
    emergencyEmail: "",
  });

  const [newMed, setNewMed] = useState("");

  const bmi = profile.height && profile.weight 
    ? (Number(profile.weight) / Math.pow(Number(profile.height) / 100, 2)).toFixed(1)
    : "0";

  const addMedication = () => {
    if (newMed.trim() && !profile.currentMeds.includes(newMed.trim())) {
      setProfile({ ...profile, currentMeds: [...profile.currentMeds, newMed.trim()] });
      setNewMed("");
    }
  };

  const removeMedication = (med: string) => {
    setProfile({ ...profile, currentMeds: profile.currentMeds.filter(m => m !== med) });
  };

  const handleSave = () => {
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Medical information</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full"
          >
            <Edit2 className="w-5 h-5 text-blue-500" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Avatar */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-3 text-white text-3xl font-semibold shadow-lg">
              {profile.name.split(" ").map(n => n[0]).join("")}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.age} years old</p>
          </div>

          {/* Personal Information */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Personal Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="h-11 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 h-11 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <Input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    disabled={!isEditing}
                    className="h-11 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <Input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    disabled={!isEditing}
                    className="h-11 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Calculated BMI</span>
                </div>
                <span className={`font-bold text-lg ${Number(bmi) >= 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {bmi}
                </span>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Emergency Contact</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={profile.emergencyPhone}
                    onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Emergency Phone"
                    className="pl-10 h-11 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={profile.emergencyEmail}
                    onChange={(e) => setProfile({ ...profile, emergencyEmail: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Emergency Email"
                    className="pl-10 h-11 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Allergies */}
          <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-900">Allergies</h3>
            </div>
            
            <Textarea
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              disabled={!isEditing}
              placeholder="List your allergies (comma separated)"
              className="min-h-20 rounded-xl border-red-200 disabled:bg-red-50 disabled:text-red-800 text-red-900 placeholder:text-red-400"
            />
            <p className="text-xs text-red-700 mt-2">
              Critical for medicine safety checks
            </p>
          </Card>

          {/* Medical Conditions */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Medical Conditions</h3>
            </div>
            
            <Textarea
              value={profile.conditions}
              onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
              disabled={!isEditing}
              placeholder="List any medical conditions"
              className="min-h-20 rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
            />
          </Card>

          {/* Current Medications */}
          <Card className="p-6 bg-white shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Current Medications</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Add a medication..."
                  className="rounded-xl border-gray-200 disabled:bg-gray-50 disabled:text-gray-600"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addMedication();
                  }}
                />
                <Button 
                  onClick={addMedication} 
                  disabled={!isEditing || !newMed.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {profile.currentMeds.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-gray-700 text-sm font-medium">{med}</span>
                    {isEditing && (
                      <button 
                        onClick={() => removeMedication(med)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {profile.currentMeds.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No medications added.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Save Button */}
          {isEditing && (
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
                  Profile Updated!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          )}

          {/* Info Card */}
          <Card className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Privacy & Security
            </h4>
            <p className="text-sm text-blue-800">
              Your medical information is encrypted and stored securely. It's only used to provide accurate medicine safety recommendations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
