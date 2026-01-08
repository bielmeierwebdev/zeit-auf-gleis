import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../src/components/layout/ProtectedRoute";
import Login from "../src/pages/Login";
import Overview from "../src/pages/Overview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
