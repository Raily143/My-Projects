import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Logo = ({ className = 'h-8' }) => (
  <span className={`relative inline-block ${className}`} aria-label="lifewood">
    <img src="/assets/lifewood-logo.png" alt="lifewood" className="h-full w-auto block footer-logo-text-light" />
    <img src="/assets/lifewood-logo.png" alt="" aria-hidden="true" className="h-full w-auto block absolute inset-0 pointer-events-none footer-logo-icon-gold" />
  </span>
);

const getFooterTitle = (pathname) => {
  if (pathname === '/news') {
    return 'Contact Us';
  }
  return 'Contact Us';
};

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'in' },
  { label: 'Facebook', href: 'https://www.facebook.com/lifewooddata', icon: 'f' },
  { label: 'Instagram', href: 'https://www.instagram.com/lifewood_data_technology/', icon: 'ig' },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: 'yt' },
];

const SocialIcon = ({ type }) => {
  if (type === 'in') {
    return (
      <svg viewBox="0 0 24 24" className="footer-social-icon fill-current" aria-hidden="true">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8 8h3.8v2.2h.05c.53-1 1.82-2.2 3.75-2.2C19.2 8 24 10.1 24 16.2V24h-4v-6.9c0-1.65-.03-3.78-2.3-3.78-2.3 0-2.66 1.8-2.66 3.66V24H11V8z" />
      </svg>
    );
  }
  if (type === 'f') {
    return (
      <svg viewBox="0 0 24 24" className="footer-social-icon fill-current" aria-hidden="true">
        <path d="M22 12a10 10 0 10-11.57 9.87v-6.99H7.9V12h2.53V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.57V12h2.8l-.45 2.88h-2.35v6.99A10 10 0 0022 12z" />
      </svg>
    );
  }
  if (type === 'ig') {
    return (
      <svg viewBox="0 0 24 24" className="footer-social-icon fill-current" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.42.61.23 1.05.52 1.5.96.44.45.73.89.96 1.5.18.46.37 1.26.42 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.42 2.43a4.03 4.03 0 01-.96 1.5 4.03 4.03 0 01-1.5.96c-.46.18-1.26.37-2.43.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.42a4.03 4.03 0 01-1.5-.96 4.03 4.03 0 01-.96-1.5c-.18-.46-.37-1.26-.42-2.43C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.42-2.43.23-.61.52-1.05.96-1.5.45-.44.89-.73 1.5-.96.46-.18 1.26-.37 2.43-.42 1.27-.06 1.65-.07 4.85-.07zm0 1.84c-3.16 0-3.53.01-4.77.07-1.06.05-1.64.23-2.02.37-.5.2-.86.43-1.24.81-.38.38-.61.74-.81 1.24-.14.38-.32.96-.37 2.02-.06 1.24-.07 1.61-.07 4.77s.01 3.53.07 4.77c.05 1.06.23 1.64.37 2.02.2.5.43.86.81 1.24.38.38.74.61 1.24.81.38.14.96.32 2.02.37 1.24.06 1.61.07 4.77.07s3.53-.01 4.77-.07c1.06-.05 1.64-.23 2.02-.37.5-.2.86-.43 1.24-.81.38-.38.61-.74.81-1.24.14-.38.32-.96.37-2.02.06-1.24.07-1.61.07-4.77s-.01-3.53-.07-4.77c-.05-1.06-.23-1.64-.37-2.02a2.2 2.2 0 00-.81-1.24 2.2 2.2 0 00-1.24-.81c-.38-.14-.96-.32-2.02-.37-1.24-.06-1.61-.07-4.77-.07zm0 3.13A4.87 4.87 0 1112 16.87 4.87 4.87 0 0112 7.13zm0 8.02a3.15 3.15 0 100-6.3 3.15 3.15 0 000 6.3zm6.2-8.66a1.14 1.14 0 11-2.28 0 1.14 1.14 0 012.28 0z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="footer-social-icon fill-current" aria-hidden="true">
      <path d="M23.5 6.2a3.02 3.02 0 00-2.13-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.37.57A3.02 3.02 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3.02 3.02 0 002.13 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.37-.57a3.02 3.02 0 002.13-2.13A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
};

const Footer = () => {
  const { pathname } = useLocation();
  const currentSection = getFooterTitle(pathname);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const footerClassName = 'landing-footer-shell py-0 -mt-6 sm:-mt-8';

  useEffect(() => {
    setShowCookieSettings(false);
  }, [pathname]);

  return (
    <footer className={footerClassName}>
      <div className="landing-footer-blend-layer" aria-hidden="true" />
      <div className="w-[98vw] max-w-[1600px] mx-auto px-1 sm:px-2 lg:px-3 landing-footer-content">
        <div className="footer-premium-card rounded-[2rem] text-white min-h-[165px] sm:min-h-[185px] px-6 sm:px-9 lg:px-12 py-6 sm:py-7 shadow-xl relative overflow-hidden">
          <div className="footer-premium-highlight" aria-hidden="true" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end relative z-10">
            <div>
              <Link to="/" className="inline-flex items-center">
                <Logo className="h-7 sm:h-8" />
              </Link>
              <p className="mt-4 text-sm sm:text-[22px] leading-relaxed max-w-3xl">
                We provide global Data Engineering Services to enable AI Solutions.
              </p>
              <Link
                to="/contact"
                className="footer-title inline-block mt-8 text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] hover:text-saffron transition-colors"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {currentSection}
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] sm:text-[11px]">
                <Link to="/privacy-policy" className="footer-policy-link transition-colors">Privacy Policy</Link>
                <Link to="/cookie-policy" className="footer-policy-link transition-colors">Cookie Policy</Link>
                <Link to="/terms-and-conditions" className="footer-policy-link transition-colors">Terms and Conditions</Link>
                <button
                  type="button"
                  onClick={() => setShowCookieSettings(true)}
                  className="footer-policy-link transition-colors"
                >
                  Cookie Settings
                </button>
              </div>
            </div>

            <div className="lg:pr-2">
              <p className="text-[10px] sm:text-[11px] text-white/90">Find Us On :</p>
              <div className="mt-3 flex items-end gap-4 sm:gap-5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link group inline-flex flex-col items-center text-white/90 transition-colors"
                  >
                    <SocialIcon type={social.icon} />
                    <span className="footer-social-label mt-1 leading-none">{social.label}</span>
                  </a>
                ))}
              </div>
              <p className="mt-5 text-[10px] sm:text-[11px] text-white/90">© 2026 Lifewood - All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>

      {showCookieSettings && (
        <div className="fixed left-3 sm:left-5 bottom-3 sm:bottom-5 z-[120]">
          <div className="w-[290px] max-w-[92vw] rounded-xl bg-white border border-gray-200 shadow-2xl p-4">
            <h3 className="text-base font-extrabold text-dark-serpent mb-2">Cookie Settings</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We use cookies to enhance your experience, analyze site traffic and deliver personalized content. Read our{' '}
              <Link to="/cookie-policy" className="text-castleton font-semibold hover:text-dark-serpent" onClick={() => setShowCookieSettings(false)}>
                Cookie Policy
              </Link>
              .
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowCookieSettings(false)}
                className="rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold py-2 hover:bg-gray-200 transition-colors"
              >
                Reject all
              </button>
              <button
                type="button"
                onClick={() => setShowCookieSettings(false)}
                className="rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold py-2 hover:bg-gray-200 transition-colors"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => setShowCookieSettings(false)}
                className="rounded-lg bg-black text-white text-sm font-semibold py-2 hover:bg-gray-900 transition-colors"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

