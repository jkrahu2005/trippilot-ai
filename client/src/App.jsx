import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import PlanTrip from "./pages/PlanTrip";
import TripResult from "./pages/TripResult";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<PlanTrip />} />
        <Route path="/trip" element={<TripResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;