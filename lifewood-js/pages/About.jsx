import React, { useEffect, useRef, useState } from 'react';

const coreValues = [
  {
    title: 'Daring',
    description:
      'We explore new possibilities and push boundaries to build better AI outcomes.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    alt: 'Innovation and exploration technology concept',
  },
  {
    title: 'Caring',
    description:
      'We work with empathy for clients, teams, and communities in every region we serve.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Collaborative teamwork and empathy in action',
  },
  {
    title: 'Integrity',
    description:
      'We act responsibly, uphold trust, and commit to quality in every delivery cycle.',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    alt: 'Professional trust and partnership handshake',
  },
  {
    title: 'Inspiring',
    description:
      'We motivate growth through innovation, collaboration, and meaningful impact.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    alt: 'Leadership and growth planning discussion',
  },
];

const tabItems = ['Mission', 'Vision', 'Core Values'];
const missionImage =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80';
const visionImage =
  'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1400&q=80';

const About = () => {
  const [activeTab, setActiveTab] = useState('Mission');
  const [coreValuesVisible, setCoreValuesVisible] = useState(false);
  const coreValuesRef = useRef(null);
  const activeTabId = activeTab.toLowerCase().replace(/\s+/g, '-');
  const pageMountainBackground =
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80';
  const pageBackgroundStyle = {
    background: `url("${pageMountainBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  useEffect(() => {
    if (activeTab !== 'Core Values') return undefined;
    if (!coreValuesRef.current) return undefined;

    setCoreValuesVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCoreValuesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(coreValuesRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  return (
    <div className="animate-in slide-in-from-bottom duration-700 home-modern-bg" style={pageBackgroundStyle}>
      <style>{`
        @keyframes aboutTabIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .about-tab-panel {
          animation: aboutTabIn 380ms ease both;
        }
        @keyframes aboutGradientDrift {
          0% { background-position: 0% 10%; }
          50% { background-position: 100% 90%; }
          100% { background-position: 0% 10%; }
        }
        @keyframes aboutCoreCardUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aboutCoreGlowDrift {
          0% { transform: translate3d(-8%, -6%, 0) scale(1); opacity: 0.72; }
          50% { transform: translate3d(6%, 4%, 0) scale(1.08); opacity: 0.9; }
          100% { transform: translate3d(-2%, 8%, 0) scale(1.02); opacity: 0.74; }
        }
        @keyframes aboutCoreBadgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .about-tab-btn {
          transition: background-color 320ms ease, color 320ms ease, box-shadow 320ms ease, transform 320ms ease;
          will-change: transform;
        }
        .about-tab-btn-active {
          background-color: #133020;
          color: #fff;
          box-shadow: 0 10px 24px rgba(19, 48, 32, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          transform: scale(1.03);
        }
        .about-tab-btn-inactive {
          background-color: #f5f3ea;
          color: #3f3f3f;
        }
        .about-tab-btn-inactive:hover {
          background-color: #ece9dd;
        }
        .about-core-shell {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border-radius: 1.9rem;
          padding: 2rem;
          background: linear-gradient(145deg, #0f3323 0%, #18533a 38%, #dce9df 100%);
          background-size: 200% 200%;
          animation: aboutGradientDrift 16s ease-in-out infinite;
          border: 1px solid rgba(255, 255, 255, 0.32);
          box-shadow: 0 22px 48px rgba(19, 48, 32, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }
        .about-core-ring {
          position: absolute;
          inset: 0.55rem;
          border-radius: 1.4rem;
          border: 1px solid rgba(255, 255, 255, 0.22);
          pointer-events: none;
          z-index: 1;
        }
        .about-core-glow {
          position: absolute;
          width: min(52vw, 520px);
          height: min(52vw, 520px);
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 195, 112, 0.38) 0%, rgba(255, 195, 112, 0) 68%);
          top: -34%;
          left: 14%;
          pointer-events: none;
          animation: aboutCoreGlowDrift 10s ease-in-out infinite;
        }
        .about-core-texture {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.14;
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.38) 0.7px, transparent 0.7px),
            radial-gradient(rgba(255, 255, 255, 0.28) 0.7px, transparent 0.7px);
          background-size: 18px 18px, 26px 26px;
          background-position: 0 0, 9px 9px;
        }
        .about-core-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 238, 219, 0.92) 100%);
          border: 1px solid rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(6px);
          transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease;
          box-shadow: 0 12px 24px rgba(19, 48, 32, 0.14);
        }
        .about-core-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0) 38%, rgba(255, 255, 255, 0.42) 50%, rgba(255, 255, 255, 0) 62%);
          transform: translateX(-120%);
          transition: transform 700ms ease;
          pointer-events: none;
        }
        .about-core-card:hover {
          transform: translateY(-7px);
          border-color: rgba(255, 255, 255, 0.96);
          box-shadow: 0 20px 36px rgba(19, 48, 32, 0.22);
        }
        .about-core-card:hover::before {
          transform: translateX(120%);
        }
        .about-core-card-image {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          height: 9rem;
        }
        .about-core-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-core-card-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(19, 48, 32, 0.06) 0%, rgba(19, 48, 32, 0.2) 100%);
        }
        .about-core-initial {
          width: 3.1rem;
          height: 3.1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          background: #133020;
          color: #f8fcf9;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          box-shadow: 0 8px 18px rgba(19, 48, 32, 0.25);
          animation: aboutCoreBadgeFloat 3.2s ease-in-out infinite;
          animation-delay: var(--core-delay, 0s);
        }
        .about-focus-image {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          height: 13rem;
          margin-bottom: 1.4rem;
        }
        .about-focus-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-focus-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(19, 48, 32, 0.03) 0%, rgba(19, 48, 32, 0.24) 100%);
        }
        .about-mission-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(4, 98, 65, 0.16);
          background: linear-gradient(160deg, #ffffff 0%, #f5eedb 58%, #e9f3ee 100%);
          box-shadow: 0 16px 36px rgba(19, 48, 32, 0.14);
        }
        .about-mission-card::before {
          content: '';
          position: absolute;
          right: -18%;
          top: -42%;
          width: 18rem;
          height: 18rem;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 179, 71, 0.32) 0%, rgba(255, 179, 71, 0) 70%);
          pointer-events: none;
        }
        .about-mission-card::after {
          content: '';
          position: absolute;
          left: -14%;
          bottom: -38%;
          width: 16rem;
          height: 16rem;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(4, 98, 65, 0.2) 0%, rgba(4, 98, 65, 0) 72%);
          pointer-events: none;
        }
        .about-mission-image {
          border: 1px solid rgba(4, 98, 65, 0.18);
          box-shadow: 0 12px 24px rgba(19, 48, 32, 0.16);
        }
        .about-core-card-hidden {
          opacity: 0;
          transform: translateY(18px);
        }
        .about-core-card-visible {
          animation: aboutCoreCardUp 420ms ease both;
        }
        @media (max-width: 640px) {
          .about-core-shell {
            border-radius: 1.4rem;
            padding: 1.2rem;
          }
          .about-focus-image {
            height: 10.5rem;
          }
          .about-core-initial {
            width: 2.8rem;
            height: 2.8rem;
            font-size: 1.8rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-tab-panel,
          .about-core-card-visible {
            animation: none;
          }
          .about-core-shell {
            animation: none;
          }
          .about-core-card,
          .about-tab-btn {
            transition: none;
          }
        }
      `}</style>

      <section className="relative overflow-hidden bg-gradient-to-br from-castleton via-dark-serpent to-castleton pt-28 md:pt-32 pb-8 md:pb-10 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 right-0 w-96 h-96 rounded-full bg-saffron/20 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-fade-in">
          <p className="section-eyebrow text-saffron">About Us</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-8">
            Lifewood Data Technology
          </h1>
          <p className="max-w-4xl text-lg sm:text-xl leading-relaxed text-dark-serpent font-medium">
            Lifewood is a global AI training data provider with delivery across text, audio,
            image, and video workflows. We empower AI development and help shape a smarter future
            through secure, scalable, and high-quality data operations.
          </p>
        </div>
      </section>

      <section className="pt-4 md:pt-6 pb-20 md:pb-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-fade-in mb-8 flex justify-center">
            <div
              role="tablist"
              aria-label="About sections"
              className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#d9decc] bg-white/85 p-1.5 shadow-[0_8px_20px_rgba(19,48,32,0.1)]"
            >
              {tabItems.map((tab) => {
                const isActive = activeTab === tab;
                const tabId = tab.toLowerCase().replace(/\s+/g, '-');

                return (
                  <button
                    key={tab}
                    id={`about-tab-${tabId}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={`about-panel-${tabId}`}
                    onClick={() => setActiveTab(tab)}
                    className={`about-tab-btn px-5 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold ${
                      isActive ? 'about-tab-btn-active' : 'about-tab-btn-inactive'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            key={activeTab}
            id={`about-panel-${activeTabId}`}
            role="tabpanel"
            aria-labelledby={`about-tab-${activeTabId}`}
            className="about-tab-panel"
          >
            {activeTab === 'Mission' && (
              <article className="about-mission-card section-fade-in rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto">
                <div className="about-focus-image about-mission-image">
                  <img src={missionImage} alt="Mission collaboration and delivery focus" loading="lazy" />
                </div>
                <p className="section-eyebrow relative z-10">Our Mission</p>
                <h3 className="relative z-10 text-3xl sm:text-4xl font-extrabold text-dark-serpent mb-4">
                  Build AI That Solves Real Problems
                </h3>
                <p className="relative z-10 text-gray-700 text-lg leading-relaxed">
                  We develop and deploy AI technologies that solve real-world challenges, empower
                  communities, and advance sustainable practices.
                </p>
              </article>
            )}

            {activeTab === 'Vision' && (
              <article
                className="section-fade-in rounded-3xl border border-[#e7dcc2] p-8 sm:p-10 text-dark-serpent shadow-[0_14px_34px_rgba(19,48,32,0.12)] max-w-4xl mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #f5eedb 0%, #ffc370 100%)',
                }}
              >
                <div className="about-focus-image">
                  <img src={visionImage} alt="Vision of AI-enabled future and global growth" loading="lazy" />
                </div>
                <p className="section-eyebrow">Our Vision</p>
                <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
                  A Global Champion in AI
                </h3>
                <p className="text-dark-serpent/90 text-lg leading-relaxed">
                  We aim to lead global AI progress by driving innovation and sustainability to create
                  a brighter future for businesses and communities worldwide.
                </p>
              </article>
            )}

            {activeTab === 'Core Values' && (
              <div ref={coreValuesRef} className="about-core-shell">
                <span className="about-core-ring" aria-hidden="true" />
                <span className="about-core-glow" aria-hidden="true" />
                <span className="about-core-texture" aria-hidden="true" />

                <div className="relative z-10 section-fade-in mb-12">
                  <p className="section-eyebrow text-[#ffc370]">Core Values</p>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
                    What Guides Lifewood
                  </h2>
                </div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {coreValues.map((value, idx) => (
                    <article
                      key={value.title}
                      className={`about-core-card rounded-3xl p-6 ${
                        coreValuesVisible ? 'about-core-card-visible' : 'about-core-card-hidden'
                      }`}
                      style={{ animationDelay: `${idx * 0.14}s`, '--core-delay': `${idx * 0.18}s` }}
                    >
                      <div className="about-core-card-image mb-5">
                        <img src={value.image} alt={value.alt} loading="lazy" />
                      </div>
                      <div className="about-core-initial mb-4" aria-hidden="true">{value.title.charAt(0)}</div>
                      <h3 className="text-2xl font-extrabold text-dark-serpent mb-3">{value.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{value.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
