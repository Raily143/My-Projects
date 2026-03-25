import React, { useEffect, useRef, useState } from 'react';
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

const communityRegions = [
  {
    name: 'South Africa',
    address: 'Johannesburg, South Africa',
    lat: -26.2041,
    lng: 28.0473,
  },
  {
    name: 'Nigeria',
    address: 'Lagos, Nigeria',
    lat: 6.5244,
    lng: 3.3792,
  },
  {
    name: 'Republic of the Congo',
    address: 'Brazzaville, Republic of the Congo',
    lat: -4.2634,
    lng: 15.2429,
  },
  {
    name: 'Democratic Republic of the Congo',
    address: 'Kinshasa, Democratic Republic of the Congo',
    lat: -4.4419,
    lng: 15.2663,
  },
  {
    name: 'Ghana',
    address: 'Accra, Ghana',
    lat: 5.6037,
    lng: -0.187,
  },
  {
    name: 'Madagascar',
    address: 'Antananarivo, Madagascar',
    lat: -18.8792,
    lng: 47.5079,
  },
  {
    name: 'Benin',
    address: 'Cotonou, Benin',
    lat: 6.3703,
    lng: 2.3912,
  },
  {
    name: 'Uganda',
    address: 'Kampala, Uganda',
    lat: 0.3476,
    lng: 32.5825,
  },
  {
    name: 'Kenya',
    address: 'Nairobi, Kenya',
    lat: -1.2921,
    lng: 36.8219,
  },
  {
    name: 'Ivory Coast',
    address: 'Abidjan, Ivory Coast',
    lat: 5.36,
    lng: -4.0083,
  },
  {
    name: 'Egypt',
    address: 'Cairo, Egypt',
    lat: 30.0444,
    lng: 31.2357,
  },
  {
    name: 'Ethiopia',
    address: 'Addis Ababa, Ethiopia',
    lat: 8.9806,
    lng: 38.7578,
  },
  {
    name: 'Niger',
    address: 'Niamey, Niger',
    lat: 13.5116,
    lng: 2.1254,
  },
  {
    name: 'Tanzania',
    address: 'Dar es Salaam, Tanzania',
    lat: -6.7924,
    lng: 39.2083,
  },
  {
    name: 'Namibia',
    address: 'Windhoek, Namibia',
    lat: -22.5609,
    lng: 17.0658,
  },
  {
    name: 'Zambia',
    address: 'Lusaka, Zambia',
    lat: -15.3875,
    lng: 28.3228,
  },
  {
    name: 'Zimbabwe',
    address: 'Harare, Zimbabwe',
    lat: -17.8292,
    lng: 31.0522,
  },
  {
    name: 'Liberia',
    address: 'Monrovia, Liberia',
    lat: 6.3156,
    lng: -10.8074,
  },
  {
    name: 'Sierra Leone',
    address: 'Freetown, Sierra Leone',
    lat: 8.4657,
    lng: -13.2317,
  },
  {
    name: 'Bangladesh',
    address: 'Dhaka, Bangladesh',
    lat: 23.8103,
    lng: 90.4125,
  },
];

const ESG = () => {
  const taglineSectionRef = useRef(null);
  const mapContainerRef = useRef(null);
  const impactMapRef = useRef(null);
  const impactMarkerRefs = useRef([]);
  const [isTaglineInView, setIsTaglineInView] = useState(false);
  const [activeCommunityIndex, setActiveCommunityIndex] = useState(0);
  const pageMountainBackground =
    'https://images.unsplash.com/photo-1698346174378-58d25db6de8a?auto=format&fit=crop&w=2400&q=80';
  const pageBackgroundStyle = {
    background: `url("${pageMountainBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  const focusCommunityOnMap = (location, index) => {
    if (!location) return;

    setActiveCommunityIndex(index);
    const map = impactMapRef.current;
    if (!map) return;

    const targetZoom = Math.max(map.getZoom(), 5);
    map.flyTo([location.lat, location.lng], targetZoom, {
      animate: true,
      duration: 1.15,
      easeLinearity: 0.25,
    });

    const marker = impactMarkerRefs.current[index];
    if (marker) {
      window.setTimeout(() => {
        marker.openPopup();
      }, 350);
    }
  };

  useEffect(() => {
    if (isTaglineInView) return;

    const target = taglineSectionRef.current;
    if (!target) return;

    if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
      setIsTaglineInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setIsTaglineInView(true);
          observer.disconnect();
        });
      },
      {
        threshold: 0.4,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [isTaglineInView]);

  useEffect(() => {
    let isCancelled = false;

    const loadImpactMap = async () => {
      if (!document.querySelector('link[data-leaflet="true"]')) {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCss.setAttribute('data-leaflet', 'true');
        document.head.appendChild(leafletCss);
      }

      if (!window.L) {
        await new Promise((resolve, reject) => {
          const leafletScript = document.createElement('script');
          leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletScript.async = true;
          leafletScript.onload = resolve;
          leafletScript.onerror = reject;
          document.body.appendChild(leafletScript);
        });
      }

      if (isCancelled || !mapContainerRef.current || impactMapRef.current || !window.L) {
        return;
      }

      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        minZoom: 2,
        maxZoom: 10,
        worldCopyJump: true,
      }).setView([4.5, 18], 3);

      impactMapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      const saffronMarkerIcon = L.icon({
        iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42">
            <path fill="#FFB347" d="M14 0C6.27 0 0 6.27 0 14c0 10.92 14 28 14 28s14-17.08 14-28C28 6.27 21.73 0 14 0z"/>
            <circle cx="14" cy="14" r="6.2" fill="#fff4df"/>
          </svg>`
        )}`,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [28, 42],
        iconAnchor: [14, 42],
        popupAnchor: [0, -34],
        shadowSize: [41, 41],
      });

      impactMarkerRefs.current = [];

      communityRegions.forEach((location, index) => {
        const marker = L.marker([location.lat, location.lng], { icon: saffronMarkerIcon })
          .addTo(map)
          .bindPopup(`<strong>${location.name}</strong><br/>${location.address}`);

        marker.on('click', () => {
          setActiveCommunityIndex(index);
        });

        impactMarkerRefs.current[index] = marker;
      });

      const bounds = L.latLngBounds(communityRegions.map((location) => [location.lat, location.lng]));
      map.fitBounds(bounds, { padding: [28, 28] });
      map.whenReady(() => {
        map.invalidateSize();
      });
    };

    loadImpactMap();

    return () => {
      isCancelled = true;
      if (impactMapRef.current) {
        impactMapRef.current.remove();
        impactMapRef.current = null;
      }
      impactMarkerRefs.current = [];
    };
  }, []);

  useEffect(() => {
    let frameId = null;

    const handleResize = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        impactMapRef.current?.invalidateSize();
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg"
      style={{ ...pageBackgroundStyle, '--esg-bg-url': `url("${pageMountainBackground}")` }}
    >
      <style>{`
        .phil-shell {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.48) !important;
          box-shadow: 0 16px 34px rgba(2, 24, 13, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.38) !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }
        .phil-shell::before {
          content: '';
          position: absolute;
          inset: -20px;
          border-radius: inherit;
          background-image: var(--esg-bg-url);
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
          filter: blur(26px) saturate(135%);
          transform: scale(1.1);
          opacity: 0.95;
          pointer-events: none;
          z-index: 0;
        }
        .phil-shell::after {
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
        .phil-shell > * {
          position: relative;
          z-index: 2;
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
        @keyframes esgTaglineMeetLeft {
          from {
            opacity: 0;
            transform: translateX(-44px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes esgTaglineMeetRight {
          from {
            opacity: 0;
            transform: translateX(44px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .esg-tagline-left,
        .esg-tagline-right {
          display: inline-block;
          will-change: transform, opacity;
          opacity: 0;
        }
        .esg-tagline-run .esg-tagline-left {
          animation: esgTaglineMeetLeft 880ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .esg-tagline-run .esg-tagline-right {
          animation: esgTaglineMeetRight 880ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .phil-hero-image img,
          .phil-impact-row-media,
          .phil-impact-row-image,
          .esg-tagline-left,
          .esg-tagline-right {
            transition: none;
            animation: none;
            opacity: 1;
            transform: none;
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

      <section className="section-fade-in pt-24 md:pt-28 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] p-7 sm:p-8 md:p-10">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[#FFB347] mb-5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.82)]"
              style={{ WebkitTextStroke: '0.55px rgba(12,35,24,0.45)' }}
            >
              Philanthropy and Impact
            </h1>
            <p className="text-[12pt] text-white leading-relaxed max-w-4xl mb-7">
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
          <div className="rounded-[2rem] p-7 sm:p-8 md:p-10 text-center">
            <p className="text-xl sm:text-2xl md:text-[2rem] text-white leading-relaxed max-w-6xl mx-auto mb-7">
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
            <h2
              className="text-4xl sm:text-5xl font-black text-dark-serpent leading-tight mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
              style={{ WebkitTextStroke: '0.45px rgba(255,255,255,0.32)' }}
            >
              Transforming Communities Worldwide
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-5 items-stretch">
              <aside className="phil-card rounded-[1.4rem] p-4 sm:p-5 xl:h-[500px] flex flex-col">
                <p className="text-[12pt] font-black uppercase tracking-[0.18em] text-castleton">
                  Impact Panel
                </p>
                <h3 className="mt-2 text-xl font-black text-dark-serpent">Community Reach</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#355146]">
                  Regions supported through Lifewood partnerships and local operations.
                </p>

                <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
                  {communityRegions.map((region, index) => {
                    const isActive = index === activeCommunityIndex;
                    return (
                      <button
                        key={region.name}
                        type="button"
                        onClick={() => focusCommunityOnMap(region, index)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition-all duration-300 ${
                          isActive
                            ? 'border-[#FFB347]/80 bg-[#fff1d7] shadow-[0_0_0_1px_rgba(255,179,71,0.24)]'
                            : 'border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(245,238,219,0.66))] hover:border-[#FFB347]/55 hover:bg-[#fff7ea]'
                        }`}
                      >
                        <p className="text-sm font-bold text-dark-serpent">{region.name}</p>
                        <p className="mt-0.5 text-xs text-[#5f7a6f]">{region.address}</p>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="min-w-0">
                <div className="phil-map-frame xl:h-[500px]">
                  <div
                    ref={mapContainerRef}
                    className="h-[360px] md:h-[460px] xl:h-full w-full"
                    aria-label="Interactive philanthropy impact map"
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
          </div>
        </div>
      </section>

      <section className="section-fade-in pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-hero-image h-[220px] sm:h-[300px] md:h-[360px]">
            <video
              src="/videos/3251808-hd_1280_720_50fps.mp4"
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </section>

      <section className="section-fade-in pt-2 pb-6 md:pt-3 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[2rem] p-4 sm:p-5 md:p-6">
              <div className="grid grid-cols-1 gap-3 items-center">
                <p className="text-[15pt] text-[#FFB347] font-medium inline-flex items-center justify-center gap-2">
                  <span className="w-7 border-t border-white/55" />
                  Impact
                </p>
                <p className="text-2xl text-white leading-relaxed text-center">
                  Through purposeful initiatives and sustainable investment, we empower communities across Africa and the Indian sub-continent to create lasting economic and social transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-fade-in pt-3 md:pt-4 pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="phil-shell rounded-[2rem] p-7 sm:p-8 md:p-10">
            <div className="space-y-4">
              {impactRows.map((item, idx) => {
                const reverse = idx % 2 === 1;
                const rowImageFallback = impactRowFallbackImages[idx % impactRowFallbackImages.length];
                const titleClass = reverse
                  ? 'lg:col-span-3 lg:col-start-10 lg:text-right lg:order-3'
                  : 'lg:col-span-3 lg:col-start-1 lg:order-1';
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
                    <h3 className={`${titleClass} text-[45px] font-black leading-[0.95] tracking-tight text-[#FFB347] drop-shadow-[0_3px_10px_rgba(0,0,0,0.42)]`}>{item.title}</h3>
                    <p className={`${copyClass} text-[12pt] text-white leading-relaxed`}>{item.copy}</p>
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

      <section ref={taglineSectionRef} className="section-fade-in pt-3 md:pt-4 pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className={`mx-auto max-w-5xl text-center text-[clamp(2rem,4.8vw,3rem)] font-extrabold text-white leading-[1.14] tracking-[-0.01em] drop-shadow-[0_3px_10px_rgba(0,0,0,0.82)] ${
              isTaglineInView ? 'esg-tagline-run' : ''
            }`}
          >
            <span className="esg-tagline-left text-saffron">Working</span>
            <span className="esg-tagline-right"> with new intelligence for a better world.</span>
          </p>
        </div>
      </section>

    </div>
  );
};

export default ESG;
