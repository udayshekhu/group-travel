import { BottomNav } from "../components/BottomNav";
import { Plus, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export default function Home() {
  // Hardcoded group members
  const members = ["Jordan", "Sam", "Alex", "Taylor"];
  const [showNotImplemented, setShowNotImplemented] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1">Test Trip</h1>
          <p className="text-gray-600 text-lg">
            The home page for your trip
          </p>
        </div>

        {/* Group Section */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                Group Members
              </h2>
              <button onClick={() => setShowNotImplemented(true)} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition shadow-md">
                <Plus size={18} strokeWidth={2.5} />
                Add Member
              </button>
            </div>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {member[0]}
                  </div>
                  <span className={`font-semibold text-lg ${member === "Jordan" ? "text-purple-600" : ""}`}>
                    {member}
                  </span>
                  {member === "Jordan" && (
                    <span className="text-sm text-gray-500">
                      (Me)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary Section */}
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-gray-900">
            <h2 className="text-2xl font-bold mb-4">
              Itinerary
            </h2>

            {/* Date selector */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setShowNotImplemented(true)} className="flex-1 bg-white border-2 border-gray-900 rounded-xl px-4 py-3 flex items-center gap-2 font-mono font-semibold text-lg text-gray-900 hover:bg-gray-50 transition">
                <Calendar size={20} />
                02-15-2026
              </button>
              <button onClick={() => setShowNotImplemented(true)} className="w-12 h-12 bg-purple-600 border-2 border-gray-900 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition shadow-md">
                <Plus
                  size={24}
                  strokeWidth={2.5}
                  className="text-white"
                />
              </button>
            </div>

            {/* 8:00 a.m. Event */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 mb-4">
              <div className="font-bold text-lg mb-2 text-gray-700">
                8:00 a.m
              </div>
              <div className="font-semibold mb-3 text-gray-700">
                Mega Plan
              </div>
              <button onClick={() => setShowNotImplemented(true)} className="flex items-center gap-1 text-sm font-semibold ml-auto text-purple-600 hover:text-purple-700 transition">
                Details <ChevronRight size={16} />
              </button>
            </div>

            {/* 9:00 a.m. Events (side by side) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
                <div className="font-bold text-lg mb-2 text-gray-700">
                  9:00 a.m
                </div>
                <div className="font-semibold mb-8 text-gray-700">
                  Plan 1
                </div>
                <button onClick={() => setShowNotImplemented(true)} className="flex items-center gap-1 text-sm font-semibold ml-auto text-purple-600 hover:text-purple-700 transition">
                  Details <ChevronRight size={16} />
                </button>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
                <div className="font-bold text-lg mb-2 text-gray-700">
                  9:00 a.m
                </div>
                <div className="font-semibold mb-8 text-gray-700">
                  Plan 2
                </div>
                <button onClick={() => setShowNotImplemented(true)} className="flex items-center gap-1 text-sm font-semibold ml-auto text-purple-600 hover:text-purple-700 transition">
                  Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
      <Dialog open={showNotImplemented} onOpenChange={setShowNotImplemented}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not Implemented</DialogTitle>
            <DialogDescription>
              This feature is not yet implemented.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}