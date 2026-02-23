import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION } from '../constants';

const Logo = ({ className = "h-8" }) => (
  <img
    src="/assets/lifewood-logo.png"
    alt="lifewood"
    className={className}
  />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileOpenDropdown(null);
  }, [location]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!navRef.current || navRef.current.contains(event.target)) return;
      setActiveDropdown(null);
      setMobileOpenDropdown(null);
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const toggleMobileDropdown = (label) => {
    setMobileOpenDropdown(mobileOpenDropdown === label ? null : label);
  };

  return (
    <nav className="floating-navbar-shell" ref={navRef}>
      <div className={`floating-navbar ${isScrolled ? 'floating-navbar-scrolled' : ''}`}>
        <div className="floating-navbar-inner">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group transition-transform hover:scale-[1.02]">
              <Logo className="h-7 sm:h-8 md:h-9" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {NAVIGATION.map((item) => (
              <div key={item.label} className="relative h-full flex items-center">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown((prev) => (prev === item.label ? null : item.label))}
                      className={`nav-hover-glow text-[13px] font-bold tracking-tight flex items-center transition-all duration-300 ease-in-out py-2 group ${
                        activeDropdown === item.label || item.children.some((child) => location.pathname === child.path)
                          ? 'text-saffron'
                          : 'text-dark-serpent hover:text-saffron'
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={activeDropdown === item.label}
                      aria-controls={`dropdown-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {item.label}
                      <svg
                        className={`ml-1.5 w-3 h-3 fill-current transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </button>

                    <div
                      id={`dropdown-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                      className={`absolute top-full left-1/2 -translate-x-1/2 w-56 floating-dropdown-panel shadow-xl rounded-xl mt-0 overflow-hidden z-[100] transition-all duration-200 ${
                        activeDropdown === item.label ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.path}
                            onClick={() => setActiveDropdown(null)}
                            className={`floating-dropdown-link block px-6 py-3 text-[13px] font-semibold transition-colors duration-200 ${
                              location.pathname === child.path ? 'text-saffron floating-dropdown-link-active' : 'text-dark-serpent hover:text-saffron'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setActiveDropdown(null)}
                    className={`nav-hover-glow text-[13px] font-bold tracking-tight flex items-center transition-all duration-300 ease-in-out py-2 group ${location.pathname === item.path ? 'text-saffron' : 'text-dark-serpent hover:text-saffron'}`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-dark-serpent hover:bg-gray-100/80 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className={`floating-mobile-panel lg:hidden ${isOpen ? 'open' : ''}`}>
          <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-5 sm:pb-6 space-y-2">
            {NAVIGATION.map((item) => (
              <div key={item.label} className="border-b border-gray-100 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                {item.children ? (
                  <button
                    type="button"
                    onClick={() => toggleMobileDropdown(item.label)}
                    className={`nav-hover-glow w-full flex items-center justify-between py-3 text-base font-bold transition-colors ${
                      mobileOpenDropdown === item.label || item.children.some((child) => location.pathname === child.path)
                        ? 'text-saffron'
                        : 'text-dark-serpent hover:text-saffron'
                    }`}
                    aria-expanded={mobileOpenDropdown === item.label}
                    aria-controls={`mobile-dropdown-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <span>{item.label}</span>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${mobileOpenDropdown === item.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => {
                      setIsOpen(false);
                      setActiveDropdown(null);
                      setMobileOpenDropdown(null);
                    }}
                    className={`nav-hover-glow block py-3 text-base font-bold transition-colors ${location.pathname === item.path ? 'text-saffron' : 'text-dark-serpent'}`}
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && (
                  <div
                    id={`mobile-dropdown-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                    className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${mobileOpenDropdown === item.label ? 'max-h-48 py-2 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path}
                        onClick={() => {
                          setIsOpen(false);
                          setActiveDropdown(null);
                          setMobileOpenDropdown(null);
                        }}
                        className={`block py-2.5 text-sm font-semibold transition-colors ${location.pathname === child.path ? 'text-saffron' : 'text-gray-600 hover:text-saffron'}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
