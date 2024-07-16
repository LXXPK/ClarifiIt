// src/components/SplashScreen.js
import React, { useEffect } from 'react';
import logo from '../assets/justlogo.png';
import './SplashScreen.css'; // Import the CSS file for styling

const SplashScreen = ({ onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 5000); // Duration of the animation + delay (5 seconds)

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="splash-screen">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
    </div>
  );
};

export default SplashScreen;
