import React, { useEffect, useRef, useState } from 'react';

const GlobalPresence = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const circularText = 'Be . Amazed . Be . Amazed .';
  const pageMountainBackground =
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80';
  const pageBackgroundStyle = {
    background: `url("${pageMountainBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  const stats = [
    { value: '56,788', label: 'Online Resources' },
    { value: '30+', label: 'Countries' },
    { value: '40+', label: 'Centers' },
  ];

  const mapLocations = [
    { name: 'San Francisco Center', address: 'San Francisco, CA, USA', lat: 37.7749, lng: -122.4194 },
    { name: 'Sao Paulo Center', address: 'Sao Paulo, Brazil', lat: -23.5505, lng: -46.6333 },
    { name: 'London Center', address: 'London, United Kingdom', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris Center', address: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Berlin Center', address: 'Berlin, Germany', lat: 52.52, lng: 13.405 },
    { name: 'Lagos Center', address: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792 },
    { name: 'Johannesburg Center', address: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473 },
    { name: 'Nairobi Center', address: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219 },
    { name: 'Dubai Center', address: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
    { name: 'Mumbai Center', address: 'Mumbai, India', lat: 19.076, lng: 72.8777 },
    { name: 'Delhi Center', address: 'Delhi, India', lat: 28.6139, lng: 77.209 },
    { name: 'Bangkok Center', address: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018 },
    { name: 'Singapore Center', address: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Kuala Lumpur Center', address: 'Kuala Lumpur, Malaysia', lat: 3.139, lng: 101.6869 },
    { name: 'Jakarta Center', address: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 },
    { name: 'Manila Center', address: 'Manila, Philippines', lat: 14.5995, lng: 120.9842 },
    { name: 'Ho Chi Minh Center', address: 'Ho Chi Minh City, Vietnam', lat: 10.8231, lng: 106.6297 },
    { name: 'Tokyo Center', address: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney Center', address: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  ];

  useEffect(() => {
    let isCancelled = false;

    const loadLeafletMap = async () => {
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

      if (isCancelled || !mapContainerRef.current || mapRef.current || !window.L) {
        return;
      }

      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        minZoom: 2,
        maxZoom: 12,
        worldCopyJump: true,
      }).setView([15, 20], 2);

      mapRef.current = map;

      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });

      const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      });

      streetLayer.addTo(map);

      L.control
        .layers(
          {
            Street: streetLayer,
            Light: lightLayer,
          },
          null,
          { position: 'topright' }
        )
        .addTo(map);

      mapLocations.forEach((location) => {
        L.marker([location.lat, location.lng]).addTo(map).bindPopup(
          `<strong>${location.name}</strong><br/>${location.address}`
        );
      });

      const bounds = L.latLngBounds(mapLocations.map((location) => [location.lat, location.lng]));
      map.fitBounds(bounds, { padding: [28, 28] });
      map.whenReady(() => {
        map.invalidateSize();
      });
    };

    loadLeafletMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    const resizeTimer = setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 180);

    return () => clearTimeout(resizeTimer);
  }, [isExpanded]);

  useEffect(() => {
    let frameId = null;

    const handleResize = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        mapRef.current?.invalidateSize();
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
    <div className="animate-in fade-in duration-700 home-modern-bg" style={pageBackgroundStyle}>
      <style>{`
        @keyframes revolveText {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <section className="pt-14 md:pt-16 pb-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 section-fade-in">
            <p className="mb-4">
              <span className="inline-flex flex-wrap items-center gap-2 rounded-[3px] bg-[#e8efe6] px-3 py-1.5 text-[0.72rem] sm:text-[0.78rem] font-extrabold uppercase tracking-[0.16em] text-[#2e7d57]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f2a33a]" aria-hidden="true" />
                <span className="leading-none">LIFEWOOD DATA TECHNOLOGY</span>
              </span>
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-dark-serpent leading-tight">
              Largest Global Data Collection
              <br />
              Resources Distribution
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] gap-6 lg:gap-7 items-stretch">
            <div className="section-fade-in min-w-0">
              <div className="relative rounded-2xl overflow-hidden border border-white/70 shadow-xl bg-white">
                <div className={`relative ${isExpanded ? 'h-[70vh]' : 'h-[420px] md:h-[500px]'}`}>
                  <div ref={mapContainerRef} className="w-full h-full" aria-label="Interactive global presence map" />

                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="absolute left-3 bottom-3 z-[500] bg-white/95 text-dark-serpent border border-gray-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold shadow hover:bg-white transition-colors"
                  >
                    {isExpanded ? 'Minimize View' : 'Maximize View'}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Drag to move, use zoom controls, switch map type at the top-right, and click markers to view addresses.
              </p>
            </div>

            <aside className="section-fade-in flex flex-col items-center lg:items-stretch w-full max-w-[360px] lg:max-w-none mx-auto">
              <div className="mb-4 flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    style={{ animation: 'revolveText 12s linear infinite' }}
                    aria-hidden="true"
                  >
                    <defs>
                      <path id="revolveTextPath" d="M 50,50 m -32,0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0" />
                    </defs>
                    <text fill="#133020" fontSize="10" fontWeight="600" textLength="201" lengthAdjust="spacing">
                      <textPath href="#revolveTextPath" startOffset="50%" textAnchor="middle">
                        {circularText}
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full bg-[#f5ae43] border-[5px] border-white shadow-sm" />
                  </div>
                </div>
                <span className="mt-1 text-[#f5ae43] text-xl leading-none" aria-hidden="true">
                  &darr;
                </span>
              </div>

              <div className="bg-[#f5ae43] rounded-3xl p-8 flex flex-col justify-center shadow-xl w-full">
                {stats.map((item, idx) => (
                  <div key={item.label} className={`${idx < stats.length - 1 ? 'pb-8 mb-8 border-b border-white/40' : ''}`}>
                    <p className="text-4xl font-extrabold text-dark-serpent mb-2">{item.value}</p>
                    <p className="text-lg font-medium text-dark-serpent">{item.label}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <p className="mt-10 text-lg text-gray-600 max-w-4xl section-fade-in">
            Lifewood operates one of the broadest global data collection networks, delivering multilingual and region-specific AI data resources through distributed production centers.
          </p>
        </div>
      </section>
    </div>
  );
};

export default GlobalPresence;
