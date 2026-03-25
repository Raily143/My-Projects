import React from 'react';
import { Link } from 'react-router-dom';

const LANDING_WELCOME_PREFIX = 'Welcome to ';
const LANDING_WELCOME_BRAND = 'Lifewood';
const LANDING_WELCOME_TEXT = `${LANDING_WELCOME_PREFIX}${LANDING_WELCOME_BRAND}`;

// modernized landing page that sits in front of the existing application
const Landing = () => {
  const [typedWelcomeLength, setTypedWelcomeLength] = React.useState(0);
  const [isDeletingWelcome, setIsDeletingWelcome] = React.useState(false);

  React.useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setTypedWelcomeLength(LANDING_WELCOME_TEXT.length);
      setIsDeletingWelcome(false);
      return;
    }

    let timeoutId = null;

    if (!isDeletingWelcome && typedWelcomeLength < LANDING_WELCOME_TEXT.length) {
      timeoutId = window.setTimeout(() => {
        setTypedWelcomeLength((prev) => Math.min(prev + 1, LANDING_WELCOME_TEXT.length));
      }, 80);
    } else if (!isDeletingWelcome && typedWelcomeLength === LANDING_WELCOME_TEXT.length) {
      timeoutId = window.setTimeout(() => {
        setIsDeletingWelcome(true);
      }, 1300);
    } else if (isDeletingWelcome && typedWelcomeLength > 0) {
      timeoutId = window.setTimeout(() => {
        setTypedWelcomeLength((prev) => Math.max(prev - 1, 0));
      }, 45);
    } else if (isDeletingWelcome && typedWelcomeLength === 0) {
      timeoutId = window.setTimeout(() => {
        setIsDeletingWelcome(false);
      }, 320);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isDeletingWelcome, typedWelcomeLength]);

  const visibleWelcomePrefix = LANDING_WELCOME_TEXT.slice(
    0,
    Math.min(typedWelcomeLength, LANDING_WELCOME_PREFIX.length)
  );
  const visibleWelcomeBrand =
    typedWelcomeLength > LANDING_WELCOME_PREFIX.length
      ? LANDING_WELCOME_TEXT.slice(LANDING_WELCOME_PREFIX.length, typedWelcomeLength)
      : '';

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
          @keyframes landingWelcomeCaret {
            0%, 49% {
              opacity: 1;
            }
            50%, 100% {
              opacity: 0;
            }
          }

          .landing-welcome-typewriter {
            display: inline-flex;
            align-items: baseline;
            max-width: 100%;
            white-space: nowrap;
          }

          .landing-welcome-caret {
            display: inline-block;
            width: 3px;
            height: 0.9em;
            margin-left: 0.08em;
            vertical-align: -0.08em;
            background: #FFB347;
            animation: landingWelcomeCaret 0.9s steps(1, end) infinite;
          }

          .landing-white-glow {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.34),
              0 10px 24px rgba(255, 255, 255, 0.24),
              0 0 24px rgba(255, 255, 255, 0.26);
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.22));
          }

          .landing-white-glow:hover,
          .landing-white-glow:focus-visible {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.5),
              0 14px 30px rgba(255, 255, 255, 0.34),
              0 0 34px rgba(255, 255, 255, 0.38);
            filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.3));
          }

          @media (prefers-reduced-motion: reduce) {
            .landing-welcome-typewriter {
              white-space: normal;
            }
            .landing-welcome-caret {
              animation: none;
            }
          }
        `}</style>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          <span className="landing-welcome-typewriter">
            <span>{visibleWelcomePrefix}</span>
            <span className="text-saffron">{visibleWelcomeBrand}</span>
            <span className="landing-welcome-caret" aria-hidden="true" />
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white max-w-xl mx-auto mb-10">
          Precision-led AI data solutions delivered globally. Explore our services or jump straight in - your journey to smarter models starts here.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/contact"
            className="contact-us-glow group inline-flex items-center justify-center gap-2 bg-saffron text-white px-5 py-2 rounded-full font-bold hover:bg-dark-serpent transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-saffron/25"
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
          <Link
            to="/careers"
            className="landing-white-glow group inline-flex items-center gap-2 rounded-full border border-castleton/30 bg-[#f5eedb] px-5 py-2 text-castleton font-bold shadow-[0_8px_20px_rgba(4,98,65,0.12)] hover:border-white/75 hover:-translate-y-0.5 transition-all duration-300"
          >
            Join Lifewood
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-saffron/20 text-castleton text-sm leading-none">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h9.59l-2.3-2.29a1 1 0 111.42-1.42l4 4a1 1 0 010 1.42l-4 4a1 1 0 11-1.42-1.42L13.59 11H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
