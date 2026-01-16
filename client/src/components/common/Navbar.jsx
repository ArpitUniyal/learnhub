import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-400"
      : "text-gray-300 hover:text-white";

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-white">
        <Link to="/" className="text-lg font-semibold tracking-wide">
          AI Smart Learning
        </Link>

        {user && (
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/" className={isActive("/")}>
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-1 rounded bg-red-500/80 hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.6)]"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
