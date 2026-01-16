import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PdfDetails from "./pages/PdfDetails";
import Home from "./pages/Home";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* DEFAULT ROUTE */}
         {/* <Route path="/" element={<Navigate to="/login" replace />} />*/}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

