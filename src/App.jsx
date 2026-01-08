import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "../src/components/layout/AppShell";
import ProtectedRoute from "../src/components/layout/ProtectedRoute";
import Login from "../src/pages/Login";
import Calendar from "../src/pages/Calendar";
import Overview from "../src/pages/Overview";
import Settings from "../src/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/" element={<Overview />} />
      </Routes>
    </BrowserRouter>
  )
}
