import React, { useState } from 'react';

const logoItems = [
  { name: 'Microsoft', src: '/logos/microsoft-official.png' },
  { name: 'FamilySearch', src: '/logos/familysearch-official.png' },
  { name: 'BYU Pathway Worldwide', src: '/logos/byu-official.png' },
  { name: 'Moore Foundation', src: '/logos/moore-official.png' },
  { name: 'Google', src: '/logos/google-official.png' },
  { name: 'Apple', src: '/logos/apple-official.png' },
  { name: 'Ancestry', src: '/logos/ancestry-official.png' },
];

const marqueeItems = [...logoItems, ...logoItems];

const ClientsPartnersSection = () => {
  const [failedLogos, setFailedLogos] = useState({});

  return (
    <section className="clients-partners-section py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 section-fade-in">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#FFB347] mb-4">Our Clients And Partners</h2>
          <p className="text-white text-base sm:text-lg max-w-5xl mx-auto leading-relaxed">
            We are proud to partner and work with leading organizations worldwide in transforming data into meaningful solutions.
            Lifewood&apos;s commitment to innovation and excellence has earned the trust of global brands across industries. Here
            are some of the valued clients and partners we&apos;ve collaborated with:
          </p>
        </div>

        <div
          className="clients-marquee-shell section-fade-in"
          style={{
            animationDelay: '0.08s',
            border: '1px solid rgba(255, 255, 255, 0.48)',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 45%, rgba(153, 255, 196, 0.08) 100%)',
            boxShadow: '0 16px 34px rgba(2, 24, 13, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.38)',
            backdropFilter: 'blur(18px) saturate(145%)',
            WebkitBackdropFilter: 'blur(18px) saturate(145%)',
            borderRadius: '1.1rem',
          }}
        >
          <div className="clients-marquee-fade clients-marquee-fade-left" aria-hidden="true" />
          <div className="clients-marquee-fade clients-marquee-fade-right" aria-hidden="true" />

          <div className="clients-marquee-track">
            {marqueeItems.map((logo, index) => (
              <article key={`${logo.name}-${index}`} className="clients-marquee-card" aria-label={logo.name}>
                {failedLogos[`${logo.name}-${index}`] ? (
                  <span className="clients-marquee-fallback">{logo.name}</span>
                ) : (
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="clients-marquee-logo"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedLogos((prev) => ({
                        ...prev,
                        [`${logo.name}-${index}`]: true,
                      }))
                    }
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsPartnersSection;
