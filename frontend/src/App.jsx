import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Captainlogin from "./pages/Captainlogin";
import CaptainSignup from "./pages/CaptainSignup";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import Map from "./pages/Map";
import RideOptions from "./pages/RideOptions";
import VehicleSelection from "./pages/VehicleSelection";
import ConfirmRide from "./pages/ConfirmRide"
import RideRequested from "./pages/RideRequest";
import CaptainHome from "./pages/CaptainHome"
import CaptainFound from "./pages/CaptainFound";
import CaptainRideDetails from "./pages/CaptainRideDetails";
import UserLiveRideTracking from "./pages/UserLiveRideTracking";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<UserLogin />} />

        <Route path="/signup" element={<UserSignup />} />

        <Route
          path="/captain-login"
          element={<Captainlogin />}
        />

        <Route
          path="/captain-signup"
          element={<CaptainSignup />}
        />

        <Route
          path="/map"
          element={<Map />}
        />

        <Route
          path="/ride-options"
          element={<RideOptions />}
        />

        <Route
          path="/vehicle-selection"
          element={<VehicleSelection />}
        />
          <Route
          path="/confirm-ride"
          element={<ConfirmRide />}
        />

        <Route
  path="/ride-requested"
  element={<RideRequested />}
/>

<Route
  path="/captain-home"
  element={<CaptainHome />}
/>
<Route path="/captain-found" element={<CaptainFound />} />
<Route
  path="/captain-ride-details"
  element={<CaptainRideDetails />}
/>


<Route
  path="/user-live-ride-tracking"
  element={<UserLiveRideTracking />}
/>
      </Routes>

    </div>
  );
};

export default App;