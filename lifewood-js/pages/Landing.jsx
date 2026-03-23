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
        <style>{`
          @keyframes landingWelcomeTypeLoop {
            0%, 12% {
              width: 0;
            }
            45%, 62% {
              width: var(--landing-type-target);
            }
            100% {
              width: 0;
            }
          }

          @keyframes landingWelcomeCaret {
            0%, 49% {
              border-right-color: #FFB347;
            }
            50%, 100% {
              border-right-color: transparent;
            }
          }

          .landing-welcome-typewriter {
            --landing-type-target: 20ch;
            display: inline-block;
            width: 0;
            max-width: 100%;
            overflow: hidden;
            white-space: nowrap;
            vertical-align: bottom;
            border-right: 3px solid #FFB347;
            animation:
              landingWelcomeTypeLoop 5.2s steps(19, end) 0.25s infinite,
              landingWelcomeCaret 0.9s steps(1, end) infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .landing-welcome-typewriter {
              animation: none;
              width: auto;
              border-right-color: transparent;
            }
          }
        `}</style>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          <span className="landing-welcome-typewriter">
            Welcome to <span className="text-saffron">Lifewood</span>
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white max-w-xl mx-auto mb-10">
          Precision-led AI data solutions delivered globally. Explore our services or jump straight in - your journey to smarter models starts here.
        </p>
        <Link
          to="/contact"
          className="contact-us-glow group inline-flex items-center justify-center gap-2 bg-saffron text-white px-9 py-3.5 rounded-full font-bold hover:bg-dark-serpent transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-saffron/25"
        >
          <span className="text-white transition-transform duration-300 group-hover:scale-[1.01]">Contact Us</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h9.59l-2.3-2.29a1 1 0 111.42-1.42l4 4a1 1 0 010 1.42l-4 4a1 1 0 11-1.42-1.42L13.59 11H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Landing;
