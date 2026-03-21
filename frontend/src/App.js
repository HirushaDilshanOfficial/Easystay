import "./App.css";
import { Routes, Route } from "react-router-dom";
import BoardingListingDashboard from "./Components/BoardingListingDashboard";
import Advertisements from "./Components/Advertisements";
import AdminDashboard from "./Components/AdminDashboard"; 

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Advertisements/>} />
        <Route path="/admin" element={<AdminDashboard/>} />
        <Route path="/owner" element={<BoardingListingDashboard/>} />   
      </Routes>
    </div>
  );
}

export default App;
