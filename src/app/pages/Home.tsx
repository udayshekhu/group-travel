import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { UserSwitcher } from "../components/UserSwitcher";
import { useNavigate } from "react-router";
import { Plus, Users, MapPin, Calendar, ChevronRight } from "lucide-react";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: string[];
}

export default function Home() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string>("");
  const [showAddTrip, setShowAddTrip] = useState(false);
  
  // New trip form
  const [newTripName, setNewTripName] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");

  useEffect(() => {
    const storedTrips = localStorage.getItem("trips");
    const storedCurrentTrip = localStorage.getItem("currentTripId");
    
    if (storedTrips) {
      const parsedTrips = JSON.parse(storedTrips);
      setTrips(parsedTrips);
      
      if (storedCurrentTrip && parsedTrips.find((t: Trip) => t.id === storedCurrentTrip)) {
        setCurrentTripId(storedCurrentTrip);
      } else if (parsedTrips.length > 0) {
        setCurrentTripId(parsedTrips[0].id);
        localStorage.setItem("currentTripId", parsedTrips[0].id);
      }
    } else {
      // Create default trip
      const defaultTrip: Trip = {
        id: Date.now().toString(),
        name: "Paris Adventure",
        destination: "Paris, France",
        startDate: "2026-07-15",
        endDate: "2026-07-22",
        members: ["Jordan", "Sam", "Alex", "Taylor"],
      };
      setTrips([defaultTrip]);
      setCurrentTripId(defaultTrip.id);
      localStorage.setItem("trips", JSON.stringify([defaultTrip]));
      localStorage.setItem("currentTripId", defaultTrip.id);
    }
  }, []);

  const currentTrip = trips.find(t => t.id === currentTripId);

  const addNewTrip = () => {
    if (newTripName.trim() && newTripDestination.trim()) {
      const newTrip: Trip = {
        id: Date.now().toString(),
        name: newTripName,
        destination: newTripDestination,
        startDate: newTripStartDate || new Date().toISOString().split('T')[0],
        endDate: newTripEndDate || new Date().toISOString().split('T')[0],
        members: ["You"],
      };
      const updatedTrips = [...trips, newTrip];
      setTrips(updatedTrips);
      localStorage.setItem("trips", JSON.stringify(updatedTrips));
      setCurrentTripId(newTrip.id);
      localStorage.setItem("currentTripId", newTrip.id);
      
      setNewTripName("");
      setNewTripDestination("");
      setNewTripStartDate("");
      setNewTripEndDate("");
      setShowAddTrip(false);
    }
  };

  const switchTrip = (tripId: string) => {
    setCurrentTripId(tripId);
    localStorage.setItem("currentTripId", tripId);
  };

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
        <div className="max-w-md mx-auto p-6">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
            <p className="text-gray-600 text-lg mb-8">Create your first trip to get started</p>
            <button
              onClick={() => setShowAddTrip(true)}
              className="bg-purple-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg hover:bg-purple-700 transition shadow-lg"
            >
              Create Trip
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysUntil = Math.ceil((new Date(currentTrip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Trip</h1>
          <p className="text-gray-600 text-lg">Plan your adventure</p>
        </div>

        {/* User Switcher */}
        <UserSwitcher />

        {/* Current Trip Card */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-6 mb-5 shadow-lg text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{currentTrip.name}</h2>
              <div className="flex items-center gap-2 mb-3 opacity-90">
                <MapPin size={18} />
                <span className="text-lg">{currentTrip.destination}</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Calendar size={18} />
                <span>{formatDate(currentTrip.startDate)} - {formatDate(currentTrip.endDate)}</span>
              </div>
            </div>
          </div>
          
          {daysUntil > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
              <span className="text-2xl font-bold">{daysUntil}</span>
              <span className="text-lg ml-2">days until departure</span>
            </div>
          )}
        </div>

        {/* Group Members */}
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-purple-600" />
            <h3 className="text-xl font-bold">Group Members</h3>
            <span className="ml-auto text-sm text-gray-500">{currentTrip.members.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentTrip.members.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {member[0]}
                </div>
                <span className="font-semibold text-purple-900">{member}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Selector */}
        {trips.length > 1 && (
          <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-3">Switch Trip</h3>
            <div className="space-y-2">
              {trips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => switchTrip(trip.id)}
                  className={`w-full text-left p-4 rounded-xl transition ${
                    trip.id === currentTripId 
                      ? 'bg-purple-50 border-2 border-purple-600' 
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{trip.name}</div>
                      <div className="text-sm text-gray-600">{trip.destination}</div>
                    </div>
                    {trip.id === currentTripId && <ChevronRight className="text-purple-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/favorites")}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-2xl text-lg hover:bg-purple-700 transition shadow-md"
          >
            Discover Places
          </button>
          <button
            onClick={() => navigate("/financials")}
            className="w-full bg-white text-purple-600 border-2 border-purple-600 font-semibold py-4 rounded-2xl text-lg hover:bg-purple-50 transition"
          >
            Manage Expenses
          </button>
          <button
            onClick={() => navigate("/tasks")}
            className="w-full bg-white text-gray-900 border border-gray-300 font-semibold py-4 rounded-2xl text-lg hover:bg-gray-50 transition"
          >
            Tasks & Notes
          </button>
        </div>

        {/* Add New Trip Button */}
        <button
          onClick={() => setShowAddTrip(!showAddTrip)}
          className="w-full mt-5 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition"
        >
          <Plus size={20} />
          Create New Trip
        </button>

        {/* Add Trip Form */}
        {showAddTrip && (
          <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4">New Trip</h3>
            <input
              type="text"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              placeholder="Trip name"
              className="w-full p-3 border border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <input
              type="text"
              value={newTripDestination}
              onChange={(e) => setNewTripDestination(e.target.value)}
              placeholder="Destination"
              className="w-full p-3 border border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <input
              type="date"
              value={newTripStartDate}
              onChange={(e) => setNewTripStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <input
              type="date"
              value={newTripEndDate}
              onChange={(e) => setNewTripEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={addNewTrip}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowAddTrip(false);
                  setNewTripName("");
                  setNewTripDestination("");
                  setNewTripStartDate("");
                  setNewTripEndDate("");
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}