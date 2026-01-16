import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // or auth key you use
    navigate("/"); // Home page
  };

  return (
    <header className="bg-gradient-to-r from-[#111827] via-[#1f2933] to-[#111827] border-b border-white/20 shadow-md backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-3">
        {/* Left */}
        <div
  className="flex items-center gap-2 cursor-pointer"
  onClick={() => navigate("/dashboard")}
>
  <img
  src="/mylogo.png"
  alt="Learnhub Logo"
  className="h-14 sm:h-16 md:h-18 object-contain"
/>

  <h1 className="text-xl font-semibold text-white">
    Learnhub
  </h1>
</div>

        {/* Right */}
        <button
          onClick={handleLogout}
          className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
