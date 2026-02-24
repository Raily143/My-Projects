import React from 'react';
import { Link } from 'react-router-dom';

const pillars = [
  {
    title: 'Inclusive Employment',
    desc: 'We prioritize hiring from underserved regions and rural communities, providing specialized digital training and competitive wages to bridge the economic gap.',
    metric: '65% Staff from Emerging Markets',
  },
  {
    title: 'Carbon Neutral AI',
    desc: 'Our delivery centers are powered by renewable energy. We optimize our training models to reduce computational waste and minimize our environmental footprint.',
    metric: '100% Carbon Neutral Operations',
  },
  {
    title: 'Ethical Data Sourcing',
    desc: 'We enforce strict transparency and consent protocols for all data collection. Our bias-detection algorithms ensure fair and representative training datasets.',
    metric: '99.9% Privacy Compliance',
  },
];

const impactStats = [
  { label: 'Female Leaders', val: '45%' },
  { label: 'Rural Reach', val: '15 Regions' },
  { label: 'Renewable Usage', val: '100%' },
  { label: 'Community Aid', val: '$2M+' },
];

const heroImageSrc = 'https://framerusercontent.com/images/y8ytmM0gtM6heQxMX7qMCrzjV8.jpeg?scale-down-to=2048';
const heroImageFallback = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=80';

const impactRowFallbackImages = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80',
];

const localImpactImageFallback = '/assets/lifewood-logo.png';

const impactRows = [
  {
    title: 'Partnership',
    copy: 'In partnership with our philanthropic partners, Lifewood has expanded operations in South Africa, Nigeria, Republic of the Congo, Democratic Republic of the Congo, Ghana, Madagascar, Benin, Uganda, Kenya, Ivory Coast, Egypt, Ethiopia, Niger, Tanzania, Namibia, Zambia, Zimbabwe, Liberia, Sierra Leone, and Bangladesh.',
    image: 'https://framerusercontent.com/images/7wnCGf5zvN4W8WfJEv3F66fD8g.jpeg?scale-down-to=1024',
    alt: 'Community training partnership session',
  },
  {
    title: 'Application',
    copy: 'This requires the application of our methods and experience for the development of people in under-resourced economies.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hands-on skills training and development',
  },
  {
    title: 'Expanding',
    copy: 'We are expanding access to training, establishing equitable wage structures and career and leadership progression to create sustainable change, by equipping individuals to take the lead and grow their businesses for themselves for the long term benefit of everyone.',
    image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Families and communities growing together',
  },
];

const ESG = () => {
  return (
    <div className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg">
      <style>{`
        .phil-shell {
          border: 1px solid rgba(255, 255, 255, 0.58);
          background: rgba(221, 214, 195, 0.78);
          box-shadow: 0 24px 46px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.42);
          backdrop-filter: blur(12px) saturate(130%);
          -webkit-backdrop-filter: blur(12px) saturate(130%);
        }
        .phil-card {
          border: 1px solid rgba(255, 255, 255, 0.66);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.42));
          box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.48);
          backdrop-filter: blur(10px) saturate(125%);
          -webkit-backdrop-filter: blur(10px) saturate(125%);
        }
        .phil-hero-image {
          border: 1px solid rgba(255, 255, 255, 0.52);
          box-shadow: 0 22px 42px rgba(15, 23, 42, 0.16);
          overflow: hidden;
          border-radius: 1.5rem;
        }
        .phil-hero-image img {
          transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease;
          transform: scale(1);
          filter: saturate(1);
        }
        .phil-hero-image:hover img {
          transform: scale(1.04);
          filter: saturate(1.05) contrast(1.02);
        }
        .phil-impact-row-media {
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms ease;
        }
        .phil-impact-row-media:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 34px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.48);
        }
        .phil-impact-row-image {
          transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease;
          transform: scale(1);
          filter: saturate(1);
        }
        .phil-impact-row-media:hover .phil-impact-row-image {
          transform: scale(1.06);
          filter: saturate(1.06) contrast(1.02);
        }
        .phil-map-frame {
          border: 1px solid rgba(255, 255, 255, 0.66);
          border-radius: 1.1rem;
          overflow: hidden;
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.58);
        }
        @media (prefers-reduced-motion: reduce) {
          .phil-hero-image img,
          .phil-impact-row-media,
          .phil-impact-row-image {
            transition: none;
          }
        }
      `}</style>

      <section className="section-fade-in pt-24 md:pt-28 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10">
            <p className="section-eyebrow">Lifewood Data Technology</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark-serpent mb-5">Philanthropy and Impact</h1>
            <p className="text-[15px] sm:text-lg text-[#24322a] leading-relaxed max-w-4xl mb-7">
              We direct resources into education and developmental projects that create lasting change. Our approach goes beyond giving; it builds sustainable growth and empowers communities for the future.
            </p>
            <Link
              to="/contact"
              className="contact-us-glow group inline-flex items-center justify-center gap-2 bg-saffron text-white px-8 py-3 rounded-full font-bold hover:bg-earth-yellow transition-all duration-300"
            >
              <span>Contact Us</span>
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

      <section className="section-fade-in pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-hero-image h-[260px] sm:h-[360px] md:h-[420px]">
            <img
              src={heroImageSrc}
              alt="People helping each other"
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== heroImageFallback) {
                  e.currentTarget.src = heroImageFallback;
                }
              }}
            />
          </div>
        </div>
      </section>

      <section className="section-fade-in pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10 text-center">
            <p className="text-xl sm:text-2xl md:text-[2rem] text-[#2a3730] leading-relaxed max-w-6xl mx-auto mb-7">
              Our vision is of a world where financial investment plays a central role in solving the social and environmental challenges facing the global community, specifically in Africa and the Indian sub-continent.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-castleton/30 bg-gradient-to-r from-white to-paper px-5 py-2 text-castleton font-bold shadow-[0_8px_20px_rgba(4,98,65,0.12)] hover:border-saffron/70 hover:shadow-[0_10px_24px_rgba(255,179,71,0.22)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Know Us Better
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-saffron/20 text-castleton text-sm leading-none">+</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-fade-in pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10">
            <h2 className="text-4xl sm:text-5xl font-black text-dark-serpent leading-tight mb-6">Transforming Communities Worldwide</h2>
            <div className="phil-map-frame">
              <iframe
                src="https://lifewoodafricamap.vercel.app/"
                title="Lifewood Africa Impact Map"
                className="w-full h-[360px] md:h-[460px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-sm text-[#314037]">
              If the map does not load, open it directly at{' '}
              <a
                href="https://lifewoodafricamap.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-castleton hover:underline"
              >
                lifewoodafricamap.vercel.app
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="section-fade-in py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 gap-6 items-center">
                <p className="text-dark-serpent font-medium inline-flex items-center justify-center gap-2">
                  <span className="w-7 border-t border-white/55" />
                  Impact
                </p>
                <p className="text-2xl text-[#2a3730] leading-relaxed text-center">
                  Through purposeful initiatives and sustainable investment, we empower communities across Africa and the Indian sub-continent to create lasting economic and social transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-fade-in pt-8 md:pt-10 pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10">
            <div className="space-y-4">
              {impactRows.map((item, idx) => {
                const reverse = idx % 2 === 1;
                const rowImageFallback = impactRowFallbackImages[idx % impactRowFallbackImages.length];
                const titleClass = reverse
                  ? 'lg:col-span-2 lg:col-start-11 lg:text-right lg:order-3'
                  : 'lg:col-span-2 lg:col-start-1 lg:order-1';
                const copyClass = reverse
                  ? 'lg:col-span-4 lg:col-start-6 lg:order-2'
                  : 'lg:col-span-4 lg:col-start-4 lg:order-2';
                const mediaClass = reverse
                  ? 'lg:col-span-5 lg:col-start-1 lg:order-1'
                  : 'lg:col-span-5 lg:col-start-8 lg:order-3';

                return (
                  <article
                    key={item.title}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center border-b border-white/35 pb-6"
                  >
                    <h3 className={`${titleClass} text-3xl font-bold text-dark-serpent`}>{item.title}</h3>
                    <p className={`${copyClass} text-sm sm:text-base text-[#344238] leading-relaxed`}>{item.copy}</p>
                    <div className={`${mediaClass} phil-card phil-impact-row-media rounded-2xl p-2`}>
                      <div className="overflow-hidden rounded-xl h-[180px]">
                        <img
                          src={item.image || rowImageFallback}
                          alt={item.alt}
                          className="h-full w-full object-cover phil-impact-row-image"
                          loading="lazy"
                          onError={(e) => {
                            const { currentTarget } = e;
                            if (currentTarget.src !== rowImageFallback) {
                              currentTarget.src = rowImageFallback;
                              return;
                            }
                            if (!currentTarget.src.endsWith(localImpactImageFallback)) {
                              currentTarget.src = localImpactImageFallback;
                            }
                          }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-fade-in pt-8 md:pt-10 pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 items-center">
                <p className="text-center text-[2rem] sm:text-[2.2rem] text-dark-serpent leading-tight">
                  <span className="text-saffron">Working</span> with new intelligence for a better world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ESG;

