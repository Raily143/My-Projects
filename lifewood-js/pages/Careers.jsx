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

const Careers = () => {
  return (
    <div className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[#032e21]/85 via-[#0a5e3f]/55 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[90rem] h-[22rem] bg-emerald-300/10 blur-3xl" />
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
          <div className="max-w-4xl">
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
              to="/contact"
              className="contact-us-glow career-hero-cta group inline-flex items-center justify-center gap-2 bg-saffron text-white px-10 py-4 rounded-full font-bold hover:bg-earth-yellow transition-colors"
            >
              <span className="career-cta-label">Contact Us</span>
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
          <h3 className="text-center mx-auto text-4xl sm:text-5xl md:text-6xl font-black text-dark-serpent leading-[1.06] tracking-[-0.02em] mb-4 md:mb-5 max-w-4xl">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
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
              <Link
                to="/contact"
                className="career-apply-cta inline-flex items-center justify-center bg-dark-serpent text-white px-8 py-3.5 rounded-full font-bold hover:bg-castleton transition-colors"
              >
                <span className="career-cta-label">Apply Through Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;

