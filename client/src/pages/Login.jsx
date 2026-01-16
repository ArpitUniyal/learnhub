import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
   const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();          // 🔑 STOPS PAGE REFRESH
    setError("");

    try {
      const res = await api.post("/auth/login", {
  email,
  password,
});

// backend already returns: { user, token }
login(res.data.user, res.data.token);
navigate("/dashboard");

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
     <div className="home-glow" />

      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">
          Login to your AI Smart Learning Assistant
        </p>

        {error && <div className="error-box">{error}</div>}

        {/* ✅ SINGLE FORM — NO NESTING */}
        <form onSubmit={handleSubmit} noValidate>
          <input
  type="text"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  name="login-email"
  autoComplete="off"
  inputMode="email"
  required
/>



<div className="relative mt-4">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="current-password"
    required
    className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-blue-500"
  />

  <span
    onClick={() => setShowPassword(prev => !prev)}
    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-200"
    style={{ pointerEvents: "auto" }}
  >
    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
  </span>
</div>


          {/* ✅ SUBMIT BUTTON INSIDE FORM */}
          <button type="submit">Login</button>
        </form>

        <p className="register-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
