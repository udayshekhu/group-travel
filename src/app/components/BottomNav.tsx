import { Home, DollarSign, Heart, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <button
          onClick={() => navigate("/")}
          className={`p-4 flex-1 transition ${isActive("/") ? "text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
        >
          <Home size={28} className="mx-auto" strokeWidth={isActive("/") ? 2.5 : 2} />
        </button>
        <button
          onClick={() => navigate("/financials")}
          className={`p-4 flex-1 transition ${
            isActive("/financials") ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <DollarSign size={28} className="mx-auto" strokeWidth={isActive("/financials") ? 2.5 : 2} />
        </button>
        <button
          onClick={() => navigate("/favorites")}
          className={`p-4 flex-1 transition ${
            isActive("/favorites") ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Heart size={28} className="mx-auto" strokeWidth={isActive("/favorites") ? 2.5 : 2} />
        </button>
        <button
          onClick={() => navigate("/tasks")}
          className={`p-4 flex-1 transition ${
            isActive("/tasks") ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Search size={28} className="mx-auto" strokeWidth={isActive("/tasks") ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
}