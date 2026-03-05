import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { User, Plus, Trash2, X } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

export function UserSwitcher() {
  const { currentUser, setCurrentUser, availableUsers, addUser, removeUser } = useUser();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [showManageMembers, setShowManageMembers] = useState(false);

  const handleAddMember = () => {
    if (newMemberName.trim() && !availableUsers.includes(newMemberName.trim())) {
      addUser(newMemberName.trim());
      setNewMemberName('');
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (userName: string) => {
    // Don't allow removing the current user or if only one user left
    if (userName !== currentUser && availableUsers.length > 1) {
      removeUser(userName);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <User size={18} />
          <span className="text-sm font-semibold">Logged in as:</span>
        </div>
        <div className="flex-1">
          <CustomSelect
            value={currentUser}
            onValueChange={setCurrentUser}
            options={availableUsers.map((user) => ({
              value: user,
              label: user,
            }))}
            placeholder="Select user"
          />
        </div>
      </div>

      {/* Add/Manage Members Buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={() => {
            setShowAddMember(!showAddMember);
            setShowManageMembers(false);
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-3 rounded-xl text-sm transition"
        >
          <Plus size={16} />
          Add Member
        </button>
        <button
          onClick={() => {
            setShowManageMembers(!showManageMembers);
            setShowAddMember(false);
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-xl text-sm transition"
        >
          <User size={16} />
          Manage ({availableUsers.length})
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddMember();
              }
            }}
            placeholder="Enter member name"
            className="w-full p-2 border-2 border-purple-300 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddMember}
              disabled={!newMemberName.trim() || availableUsers.includes(newMemberName.trim())}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-xl text-sm font-semibold transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddMember(false);
                setNewMemberName('');
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manage Members List */}
      {showManageMembers && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
          {availableUsers.map((user) => (
            <div
              key={user}
              className={`flex items-center justify-between p-2 rounded-xl ${
                user === currentUser ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user[0]}
                </div>
                <span className="font-semibold text-sm">
                  {user}
                  {user === currentUser && (
                    <span className="text-xs text-purple-600 ml-2">(You)</span>
                  )}
                </span>
              </div>
              {user !== currentUser && availableUsers.length > 1 && (
                <button
                  onClick={() => handleRemoveMember(user)}
                  className="text-red-500 hover:text-red-700 transition p-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {availableUsers.length === 1 && (
            <p className="text-xs text-gray-500 text-center py-2">
              Cannot remove the only member
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        Switch users to test different perspectives
      </p>
    </div>
  );
}