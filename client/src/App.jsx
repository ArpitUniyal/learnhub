import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PdfDetails from "./pages/PdfDetails";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return user
    ? <Navigate to="/dashboard" replace />
    : <Home />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/" element={<RootRedirect />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
  path="/reset-password"
  element={<ResetPassword />}
/>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdf/:id"
            element={
              <ProtectedRoute>
                <PdfDetails />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
