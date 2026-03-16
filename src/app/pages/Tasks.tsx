import { BottomNav } from "../components/BottomNav";
import {
  Plus,
  ChevronDown,
  Trash2,
  Calendar,
} from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";
import { Checkbox } from "../components/ui/checkbox";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

interface Task {
  id: string;
  text: string;
  date: string;
  assignedTo: string;
  completed: boolean;
  timestamp: number;
}

export default function Tasks() {
  const [open, setOpen] = useState(false);
  const [showNotImplemented, setShowNotImplemented] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1">Tasks</h1>
          <p className="text-gray-600 text-lg">
            Track group responsibilities
          </p>
        </div>

        {/* View Filter Row with User and Date */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-lg font-semibold">
              View:
            </label>
            <button onClick={() => setShowNotImplemented(true)} className="bg-white border-2 border-gray-900 rounded-xl px-4 py-3 flex items-center gap-2 font-semibold text-purple-600">
              <span>Jordan</span>
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setShowNotImplemented(true)} className="bg-white border-2 border-gray-900 rounded-xl px-4 py-3 flex items-center gap-2 text-gray-900 font-mono font-semibold hover:bg-gray-50 transition">
              <Calendar size={20} />
              <span>02-15-2026</span>
            </button>
            <button className="w-12 h-12 bg-purple-600 border-2 border-gray-900 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition shadow-md" onClick={() => setShowNotImplemented(true)}>
              <Plus size={24} strokeWidth={2.5} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {/* Fake Task */}
          <div className="bg-white border-2 border-gray-900 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Checkbox disabled className="mt-1 border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-900">
                  Buy Groceries
                </p>
              </div>
            </div>
          </div>

          {/* Cook Food Task */}
          <div className="bg-white border-2 border-gray-900 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Checkbox disabled className="mt-1 border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-900">
                  Cook Food
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />

      {/* Add Task Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Add a new task to the list.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Not Implemented Dialog */}
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