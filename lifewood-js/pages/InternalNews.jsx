import React from 'react';
import { Link } from 'react-router-dom';

const InternalNews = () => {
  const pageMountainBackground =
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80';
  const pageBackgroundStyle = {
    background: `url("${pageMountainBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  return (
    <div
      className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg"
      style={{ ...pageBackgroundStyle, '--internal-news-bg-url': `url("${pageMountainBackground}")` }}
    >
      <style>{`
        .internal-news-blur-container {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.48) !important;
          box-shadow: 0 16px 34px rgba(2, 24, 13, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.38) !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }
        .internal-news-blur-container::before {
          content: '';
          position: absolute;
          inset: -20px;
          border-radius: inherit;
          background-image: var(--internal-news-bg-url);
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
          filter: blur(26px) saturate(135%);
          transform: scale(1.1);
          opacity: 0.95;
          pointer-events: none;
          z-index: 0;
        }
        .internal-news-blur-container::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.22) 45%, rgba(153, 255, 196, 0.14) 100%);
          backdrop-filter: blur(34px) saturate(170%) !important;
          -webkit-backdrop-filter: blur(34px) saturate(170%) !important;
          pointer-events: none;
          z-index: 1;
        }
        .internal-news-blur-container > * {
          position: relative;
          z-index: 2;
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[#032e21]/85 via-[#0a5e3f]/55 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140vw] max-w-[90rem] h-[16rem] sm:h-[20rem] md:h-[22rem] bg-emerald-300/10 blur-3xl" />
        <div
          className="absolute inset-x-0 top-0 h-52 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.24) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <section className="section-fade-in relative z-10 pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-14 internal-news-blur-container rounded-[22px] p-7 sm:p-8 md:p-10">
            <span className="internal-news-label inline-flex items-center gap-2 text-xs sm:text-sm uppercase font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-saffron inline-block" />
              Internal News
            </span>
            <h1 className="internal-news-headline text-4xl sm:text-5xl md:text-6xl font-black mb-5 leading-tight">
              Rootstech 2026
            </h1>
            <p className="internal-news-coming text-3xl sm:text-4xl md:text-5xl font-black text-saffron mb-6">
              Coming Soon!
            </p>
            <p className="internal-news-copy text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-9">
              We are preparing event highlights and internal updates for our teams and partners. Stay tuned for
              the latest announcements from Lifewood.
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

          <div className="max-w-5xl mx-auto">
            <div className="internal-news-blur-container rounded-[22px] p-3 sm:p-4 md:p-5">
              <div className="relative w-full overflow-hidden rounded-[1.4rem]" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/ccyrQ87EJag"
                  title="Rootstech 2026 - Lifewood Internal News"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InternalNews;
