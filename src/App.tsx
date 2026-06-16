import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import BatteryList from "@/pages/BatteryList";
import AddBattery from "@/pages/AddBattery";
import BatteryDetail from "@/pages/BatteryDetail";
import ScanBattery from "@/pages/ScanBattery";
import AppliancePairingList from "@/pages/AppliancePairingList";
import AddAppliancePairing from "@/pages/AddAppliancePairing";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batteries" element={<BatteryList />} />
          <Route path="/batteries/add" element={<AddBattery />} />
          <Route path="/batteries/:id" element={<BatteryDetail />} />
          <Route path="/scan" element={<ScanBattery />} />
          <Route path="/appliance-pairings" element={<AppliancePairingList />} />
          <Route path="/appliance-pairings/add" element={<AddAppliancePairing />} />
          <Route path="/appliance-pairings/edit/:id" element={<AddAppliancePairing />} />
        </Route>
      </Routes>
    </Router>
  );
}
