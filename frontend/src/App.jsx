import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import User from "./pages/UserSignup";
import Captainlogin from "./pages/Captainlogin";
import CaptainSignup from "./pages/CaptainSignup";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<UserLogin/>} />

        <Route path="/signup" element={<UserSignup/>} />

        <Route path="/captain-login" element={<Captainlogin />} />

        <Route path="/captain-signup" element={<CaptainSignup />} />
      </Routes>
    </div>
  );
};

export default App;