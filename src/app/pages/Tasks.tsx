import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { Plus, ChevronDown, Trash2 } from "lucide-react";

interface Task {
  id: string;
  text: string;
  date: string;
  assignedTo: string;
  completed: boolean;
  timestamp: number;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTrip, setCurrentTrip] = useState({ name: "Test Trip", members: ["Me", "Jordan", "Sam", "Alex"] });
  const [selectedMember, setSelectedMember] = useState("Me");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Me");

  useEffect(() => {
    const storedTasks = localStorage.getItem("tripTasks");
    if (storedTasks) setTasks(JSON.parse(storedTasks));

    // Get current trip info
    const storedTrips = localStorage.getItem("trips");
    const storedCurrentTripId = localStorage.getItem("currentTripId");
    if (storedTrips && storedCurrentTripId) {
      const trips = JSON.parse(storedTrips);
      const trip = trips.find((t: any) => t.id === storedCurrentTripId);
      if (trip) {
        setCurrentTrip({ name: trip.name, members: ["Me", ...trip.members] });
      }
    }
  }, []);

  const addTask = () => {
    if (newTaskText.trim() && newTaskDate) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTaskText,
        date: newTaskDate,
        assignedTo: newTaskAssignee,
        completed: false,
        timestamp: Date.now(),
      };
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      localStorage.setItem("tripTasks", JSON.stringify(updatedTasks));
      
      setNewTaskText("");
      setNewTaskDate("");
      setNewTaskAssignee("Me");
      setShowAddTask(false);
    } else {
      // Provide feedback if fields are missing
      alert("Please fill in both task description and date");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskText.trim() && newTaskDate) {
      addTask();
    }
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tripTasks", JSON.stringify(updatedTasks));
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem("tripTasks", JSON.stringify(updatedTasks));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const filteredTasks = selectedMember === "Me" 
    ? tasks 
    : tasks.filter(task => task.assignedTo === selectedMember);

  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1">Tasks : {currentTrip.name}</h1>
        </div>

        {/* View Filter */}
        <div className="mb-5">
          <label className="block text-lg font-semibold mb-2">View:</label>
          <div className="relative">
            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className="w-full bg-white border-2 border-gray-900 rounded-xl px-4 py-3 text-left flex items-center justify-between font-semibold hover:bg-gray-50 transition"
            >
              <span>{selectedMember}</span>
              <ChevronDown size={20} />
            </button>
            
            {showMemberDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-900 rounded-xl shadow-lg overflow-hidden z-10">
                {currentTrip.members.map((member, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMember(member);
                      setShowMemberDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition ${
                      member === selectedMember ? 'bg-purple-100 font-semibold' : ''
                    }`}
                  >
                    {member}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Section */}
        {showAddTask ? (
          <div className="mb-5 bg-white border-2 border-gray-900 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-3">New Task</h3>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Task description"
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              onKeyPress={handleKeyPress}
            />
            <input
              type="date"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              onKeyPress={handleKeyPress}
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              {currentTrip.members.map((member, index) => (
                <option key={index} value={member}>{member}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold border-2 border-gray-900"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskText("");
                  setNewTaskDate("");
                  setNewTaskAssignee("Me");
                }}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition font-semibold border-2 border-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full mb-5 bg-white border-2 border-gray-900 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-900 rounded"></div>
              <span className="text-lg font-semibold text-gray-400">Add new task...</span>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100">
              <Plus size={24} strokeWidth={2.5} />
            </div>
          </button>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-900 p-8">
              <p className="text-gray-500 text-lg">No tasks yet</p>
              <p className="text-gray-400 text-sm mt-2">Add a task to get started!</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border-2 border-gray-900 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 w-6 h-6 border-2 border-gray-900 rounded flex items-center justify-center flex-shrink-0 transition ${
                      task.completed ? 'bg-purple-600 border-purple-600' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <p className={`text-lg font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.text}
                      </p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="ml-2 p-1 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-semibold">{formatDate(task.date)}</span>
                      {task.assignedTo !== "Me" && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-semibold">
                          {task.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}