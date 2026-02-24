import React from 'react';
import { Link } from 'react-router-dom';

const InternalNews = () => {
  return (
    <div className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[#032e21]/85 via-[#0a5e3f]/55 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[90rem] h-[22rem] bg-emerald-300/10 blur-3xl" />
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
          <div className="text-center mb-12 md:mb-14">
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
            <div className="rounded-[2rem] border border-gray-100 bg-white/85 backdrop-blur-sm shadow-xl p-3 sm:p-4 md:p-5">
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
