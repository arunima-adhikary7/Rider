import React from "react";
import { Routes, Route } from "react-router-dom";

// =====================================================
// PAGES
// =====================================================

import Home from "./pages/Home";

import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";

import Captainlogin from "./pages/Captainlogin";
import CaptainSignup from "./pages/CaptainSignup";

import Map from "./pages/Map";
import RideOptions from "./pages/RideOptions";
import VehicleSelection from "./pages/VehicleSelection";
import ConfirmRide from "./pages/ConfirmRide";
import RideRequested from "./pages/RideRequest";

import CaptainHome from "./pages/CaptainHome";
import CaptainFound from "./pages/CaptainFound";
import CaptainRideDetails from "./pages/CaptainRideDetails";

import UserLiveRideTracking from "./pages/UserLiveRideTracking";

// =====================================================
// APP
// =====================================================

const App = () => {
  return (
    <div className="min-h-screen">
      <Routes>

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =================================================
            USER AUTH
        ================================================= */}

        <Route
          path="/login"
          element={<UserLogin />}
        />

        <Route
          path="/signup"
          element={<UserSignup />}
        />

        {/* =================================================
            CAPTAIN AUTH
        ================================================= */}

        <Route
          path="/captain-login"
          element={<Captainlogin />}
        />

        <Route
          path="/captain-signup"
          element={<CaptainSignup />}
        />

        {/* =================================================
            USER RIDE FLOW
        ================================================= */}

        {/* User starts booking */}
        <Route
          path="/map"
          element={<Map />}
        />

        {/* Select vehicle / ride option */}
        <Route
          path="/ride-options"
          element={<RideOptions />}
        />

        {/* Select vehicle */}
        <Route
          path="/vehicle-selection"
          element={<VehicleSelection />}
        />

        {/* Confirm ride */}
        <Route
          path="/confirm-ride"
          element={<ConfirmRide />}
        />

        {/* Ride requested */}
        <Route
          path="/ride-requested"
          element={<RideRequested />}
        />

        {/* =================================================
            CAPTAIN FLOW
        ================================================= */}

        {/* Captain dashboard */}
        <Route
          path="/captain-home"
          element={<CaptainHome />}
        />

        {/* Captain found */}
        <Route
          path="/captain-found"
          element={<CaptainFound />}
        />

        {/* Captain ride details */}
        <Route
          path="/captain-ride-details"
          element={<CaptainRideDetails />}
        />

        {/* =================================================
            USER LIVE RIDE
        ================================================= */}

        <Route
          path="/user-live-ride-tracking"
          element={<UserLiveRideTracking />}
        />

      </Routes>
    </div>
  );
};

export default App;