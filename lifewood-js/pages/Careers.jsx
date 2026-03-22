import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  {
    value: '7,000+',
    label: 'AI specialists worldwide',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
    alt: 'Global AI workforce collaborating across teams'
  },
  {
    value: '95+',
    label: 'Operational locations',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    alt: 'Global operations and delivery locations'
  },
  {
    value: '45+',
    label: 'Countries with active teams',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80',
    alt: 'Worldwide regional team presence'
  },
  {
    value: '20',
    label: 'Years of delivery experience',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    alt: 'Long-term enterprise delivery experience'
  }
];

const careerKeywordRows = [
  ['Supportive', 'Collaborative', 'Innovative', 'Flexible'],
  ['Transparent', 'Engaging', 'Diverse', 'Purpose-driven'],
  ['Balanced (work-life balance)', 'Trustworthy', 'Professional', 'Reliable']
];
const careerPrincipleCards = [
  { id: 1, text: 'There is no need to ask for too much explanation.' },
  { id: 2, text: 'One feasible solution is worth a hundred useless excuses.' },
  { id: 3, text: 'There is no need for pointless worry.' },
  { id: 4, text: 'Immediately put things into practice; improve while working.' },
  { id: 5, text: 'Wisdom must be used to tackle difficult circumstances.' },
  { id: 6, text: 'Do not demand perfection at the start.' },
  { id: 7, text: 'Do not be restricted by tradition; have courage to implement reform.' },
];

const Careers = () => {
  const pageMountainBackground =
    'https://images.unsplash.com/photo-1698346174378-58d25db6de8a?auto=format&fit=crop&w=2400&q=80';
  const pageBackgroundStyle = {
    background: `url("${pageMountainBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  return (
    <div
      className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg"
      style={{ ...pageBackgroundStyle, '--careers-bg-url': `url("${pageMountainBackground}")` }}
    >
      <style>{`
        .careers-blur-container {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.48) !important;
          box-shadow: 0 16px 34px rgba(2, 24, 13, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.38) !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }
        .careers-blur-container::before {
          content: '';
          position: absolute;
          inset: -20px;
          border-radius: inherit;
          background-image: var(--careers-bg-url);
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
          filter: blur(26px) saturate(135%);
          transform: scale(1.1);
          opacity: 0.95;
          pointer-events: none;
          z-index: 0;
        }
        .careers-blur-container::after {
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
        .careers-blur-container > * {
          position: relative;
          z-index: 2;
        }
        .careers-principle-shell {
          position: relative;
          isolation: isolate;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background: linear-gradient(140deg, rgba(255, 255, 255, 0.26) 0%, rgba(245, 238, 219, 0.2) 45%, rgba(4, 98, 65, 0.14) 100%);
          backdrop-filter: blur(18px) saturate(150%);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          box-shadow: 0 18px 34px rgba(8, 33, 23, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.52);
          animation: careersPrincipleShellIn 560ms ease both;
        }
        @keyframes careersPrincipleShellIn {
          from { opacity: 0; transform: translateY(16px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes careersPrincipleTitleGlow {
          0%, 100% { text-shadow: 0 2px 6px rgba(0,0,0,0.38), 0 0 0 rgba(255,179,71,0); }
          50% { text-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 16px rgba(255,179,71,0.32); }
        }
        .careers-principle-title {
          animation: careersPrincipleTitleGlow 3.2s ease-in-out infinite;
        }
        .careers-principle-card {
          position: relative;
          overflow: hidden;
          border-radius: 0.95rem;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 238, 219, 0.36) 52%, rgba(229, 243, 236, 0.32) 100%);
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          box-shadow: 0 10px 20px rgba(11, 42, 29, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.62);
          animation:
            careersPrincipleCardIn 520ms cubic-bezier(0.22, 1, 0.36, 1) both,
            careersPrincipleCardFloat 6.4s ease-in-out infinite;
          animation-delay:
            var(--principle-delay, 0s),
            calc(var(--principle-delay, 0s) + 0.7s);
        }
        @keyframes careersPrincipleCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes careersPrincipleCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes careersPrincipleSheen {
          0% { transform: translateX(-135%); opacity: 0; }
          20% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(135%); opacity: 0; }
        }
        .careers-principle-card::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 42%;
          background: linear-gradient(105deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.35) 52%, rgba(255, 255, 255, 0) 100%);
          pointer-events: none;
          animation: careersPrincipleSheen 5.8s ease-in-out infinite;
          animation-delay: calc(var(--principle-delay, 0s) + 1.2s);
        }
        .careers-principle-card::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(118deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 38%, rgba(255, 179, 71, 0.1) 100%);
        }
        .careers-principle-number {
          color: #046241;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
          font-weight: 800;
        }
        .careers-principle-text {
          color: #113525;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.42);
          font-weight: 700;
          letter-spacing: 0.005em;
        }
        @media (prefers-reduced-motion: reduce) {
          .careers-principle-shell,
          .careers-principle-title,
          .careers-principle-card,
          .careers-principle-card::before {
            animation: none;
          }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[#032e21]/85 via-[#0a5e3f]/55 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140vw] max-w-[90rem] h-[16rem] sm:h-[20rem] md:h-[22rem] bg-emerald-300/10 blur-3xl" />
        <div
          className="absolute inset-x-0 top-0 h-52 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.24) 1px, transparent 0)',
            backgroundSize: '22px 22px'
          }}
        />
      </div>

      <section className="section-fade-in bg-gradient-to-br from-dark-serpent via-castleton to-dark-serpent pt-28 md:pt-32 pb-14 md:pb-16 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl careers-blur-container rounded-[22px] p-7 sm:p-8 md:p-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
              Lifewood <span className="text-saffron">Careers</span>
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-[#f5eedb] mb-8">Always On Never Off</p>
            <p className="text-gray-100 text-base sm:text-lg leading-relaxed mb-5">
              We are one of the global leaders in AI data technology, with teams working across data acquisition, collection, annotation, curation, and validation.
            </p>
            <p className="text-gray-100 text-base sm:text-lg leading-relaxed mb-10">
              We invest in people who learn fast, adapt quickly, and deliver quality with consistency. If you are ready to build the future of AI with global teams, we want to hear from you.
            </p>

            <Link
              to="/create-account"
              className="contact-us-glow career-hero-cta group inline-flex items-center justify-center gap-2 bg-saffron text-white px-10 py-4 rounded-full font-bold hover:bg-earth-yellow transition-colors"
            >
              <span className="career-cta-label">Join Us Now</span>
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
      </section>

      <section className="section-fade-in pt-8 md:pt-10 pb-16 md:pb-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="career-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
            {stats.map((item, idx) => (
              <article
                key={item.label}
                className="career-stat-card section-fade-in"
                style={{ animationDelay: `${idx * 0.08}s` }}
                tabIndex={0}
                aria-label={`${item.value} ${item.label}`}
              >
                <img src={item.image} alt={item.alt} className="career-stat-bg" loading="lazy" />
                <div className="career-stat-overlay" aria-hidden="true" />
                <div className="career-stat-content">
                  <p className="career-stat-value">{item.value}</p>
                  <p className="career-stat-label">{item.label}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-fade-in pt-2 md:pt-3 pb-6 md:pb-8 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3
            className="text-center mx-auto text-4xl sm:text-5xl md:text-6xl font-black text-[#fffdf6] drop-shadow-[0_3px_12px_rgba(0,0,0,0.78)] leading-[1.06] tracking-[-0.02em] mb-4 md:mb-5 max-w-4xl"
            style={{ WebkitTextStroke: '0.6px rgba(15,47,33,0.42)' }}
          >
            <span className="block">It means motivating</span>
            <span className="block">and growing teams</span>
          </h3>
          <p className="max-w-4xl mx-auto text-center text-lg md:text-2xl leading-relaxed text-dark-serpent mb-5 md:mb-6">
            Teams that can initiate and learn on the run in order to deliver evolving technologies and targets. It&apos;s a big challenge, but innovation, especially across borders, has never been the easy path.
          </p>
          <div className="career-keywords-shell">
            {careerKeywordRows.map((row, rowIdx) => (
              <div key={`career-keyword-row-${rowIdx}`} className="career-keywords-marquee" aria-label={`Career values row ${rowIdx + 1}`}>
                <ul
                  className={`career-keywords-track ${rowIdx === 1 ? 'is-right' : ''}`}
                  style={{ '--career-marquee-duration': '8s' }}
                >
                  {Array.from({ length: 4 }).map((_, copyIdx) =>
                    row.map((keyword, idx) => (
                      <li
                        key={`kw-${rowIdx}-${copyIdx}-${idx}`}
                        className="career-keyword-chip"
                        aria-hidden={copyIdx > 0 ? 'true' : undefined}
                      >
                        {keyword}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-fade-in pt-10 md:pt-12 pb-20 md:pb-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center careers-blur-container rounded-[22px] p-7 sm:p-8 md:p-10">
            <div className="career-photo-card rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="Lifewood global team"
                className="career-photo-img w-full h-full object-cover min-h-[280px]"
              />
            </div>
            <div>
              <h2 className="text-[2.2rem] md:text-5xl font-black tracking-[-0.02em] leading-[1.08] text-dark-serpent mb-5">
                <span className="block">Join our team</span>
                <span className="block text-castleton">and grow with us</span>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lifewood combines high-performance delivery standards with practical mentorship and cross-border collaboration. Our teams support mission-critical data programs for enterprises building AI at scale.
              </p>
              <p className="text-gray-700 leading-relaxed mb-8">
                From operations and linguistics to quality engineering and project management, we create opportunities for professionals who want to shape real-world AI outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="careers-principle-shell rounded-3xl px-2 sm:px-3 pt-5 sm:pt-6 pb-2 sm:pb-3 max-w-5xl mx-auto">
            <h3 className="careers-principle-title px-2 sm:px-3 pb-3 sm:pb-4 text-center text-2xl sm:text-3xl font-extrabold text-[#FFB347] drop-shadow-[0_2px_6px_rgba(0,0,0,0.38)]">
              Seven Principles of Work
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {careerPrincipleCards.map((card, idx) => (
                <article
                  key={`careers-principle-${card.id}`}
                  className={`careers-principle-card min-h-[72px] px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-4 ${
                    card.id === 7 ? 'sm:col-span-2' : ''
                  }`}
                  style={{ '--principle-delay': `${idx * 0.12}s` }}
                >
                  <span className="careers-principle-number text-[1.7rem] leading-none min-w-[1rem]">
                    {card.id}
                  </span>
                  <p className="careers-principle-text text-[1.05rem] leading-snug">
                    {card.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;

