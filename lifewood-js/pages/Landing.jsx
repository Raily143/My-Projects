import React from 'react';
import { Link } from 'react-router-dom';

// modernized landing page that sits in front of the existing application
const Landing = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center brand-modern-bg overflow-hidden landing-video-shell">
      <video
        className="landing-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/3141208-uhd_3840_2160_25fps.mp4" type="video/mp4" />
      </video>
      <div className="landing-hero-overlay" />

      {/* subtle geometric background */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#046241" opacity="0.03" />
            </pattern>
            <linearGradient id="landingGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#f5eedb" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
          <rect width="100%" height="100%" fill="url(#landingGrad)" opacity="0.2" />
        </svg>
      </div>

      <div className="relative z-[2] px-6">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          Welcome to <span className="text-saffron">Lifewood</span>
        </h1>
        <p className="text-lg sm:text-xl text-white max-w-xl mx-auto mb-10">
          Precision-led AI data solutions delivered globally. Explore our services or jump straight in - your journey to smarter models starts here.
        </p>
        <Link
          to="/create-account"
          className="landing-create-account-btn inline-flex items-center justify-center bg-saffron text-dark-serpent px-9 sm:px-12 py-3.5 rounded-full text-lg sm:text-xl font-semibold shadow-lg shadow-saffron/25 hover:bg-earth-yellow transition-colors duration-300"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Landing;
