import React, { useEffect, useMemo, useRef, useState } from 'react';

const GlobalPresence = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeOfficeIndex, setActiveOfficeIndex] = useState(0);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const circularText = ' . Be . Amazed . Be . Amazed ';
  const pageMountainBackground =
    'https://images.unsplash.com/photo-1698346174378-58d25db6de8a?auto=format&fit=crop&w=2400&q=80';
  const pageBackgroundStyle = {
    background: `url("${pageMountainBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  const stats = [
    { target: 56788, suffix: '', label: 'Online Resources' },
    { target: 30, suffix: '+', label: 'Countries' },
    { target: 40, suffix: '+', label: 'Centers' },
  ];
  const [animatedStatValues, setAnimatedStatValues] = useState(() => stats.map(() => 0));

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

  const sortedOfficeLocations = useMemo(() => {
    const getCountryFromAddress = (address) => {
      const parts = String(address || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      return parts[parts.length - 1] || '';
    };

    return mapLocations
      .map((location, originalIndex) => ({
        ...location,
        originalIndex,
        country: getCountryFromAddress(location.address),
      }))
      .sort((a, b) => {
        const countryCompare = a.country.localeCompare(b.country, undefined, { sensitivity: 'base' });
        if (countryCompare !== 0) return countryCompare;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
  }, [mapLocations]);

  const focusOfficeOnMap = (location, index) => {
    if (!location) return;

    setActiveOfficeIndex(index);
    const map = mapRef.current;
    if (!map) return;

    const targetZoom = Math.max(map.getZoom(), 5);
    map.flyTo([location.lat, location.lng], targetZoom, {
      animate: true,
      duration: 1.15,
      easeLinearity: 0.25,
    });

    const marker = markerRefs.current[index];
    if (marker) {
      window.setTimeout(() => {
        marker.openPopup();
      }, 350);
    }
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setAnimatedStatValues(stats.map((item) => item.target));
      return;
    }

    const durationMs = 1700;
    const staggerMs = 180;
    const startTime = performance.now();
    let frameId = null;

    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    const animate = (timestamp) => {
      const nextValues = stats.map((item, index) => {
        const elapsed = timestamp - startTime - index * staggerMs;
        if (elapsed <= 0) return 0;

        const progress = Math.min(elapsed / durationMs, 1);
        const eased = easeOutCubic(progress);
        return Math.round(item.target * eased);
      });

      setAnimatedStatValues(nextValues);

      const finished = nextValues.every((value, index) => value >= stats[index].target);
      if (!finished) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

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

      const mapViewLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });

      const lightGrayLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      });

      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        }
      );

      const hybridLabelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        }
      );

      const hybridLayer = L.layerGroup([satelliteLayer, hybridLabelsLayer]);

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

      mapViewLayer.addTo(map);
      markerRefs.current = [];

      L.control
        .layers(
          {
            '🌐 Hybrid View': hybridLayer,
            '🗺️ Map View': mapViewLayer,
            '📡 Satellite View': satelliteLayer,
            '⚪ Light Gray View': lightGrayLayer,
          },
          null,
          { position: 'topright' }
        )
        .addTo(map);

      mapLocations.forEach((location, index) => {
        const marker = L.marker([location.lat, location.lng], { icon: saffronMarkerIcon }).addTo(map).bindPopup(
          `<strong>${location.name}</strong><br/>${location.address}`
        );

        marker.on('click', () => {
          setActiveOfficeIndex(index);
        });

        markerRefs.current[index] = marker;
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
      markerRefs.current = [];
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
    <div
      className="animate-in fade-in duration-700 home-modern-bg"
      style={{ ...pageBackgroundStyle, '--company-bg-url': `url("${pageMountainBackground}")` }}
    >
      <style>{`
        @keyframes revolveText {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .company-reference-board {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.48) !important;
          box-shadow: 0 16px 34px rgba(2, 24, 13, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.38) !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }
        .company-reference-board::before {
          content: '';
          position: absolute;
          inset: -20px;
          border-radius: inherit;
          background-image: var(--company-bg-url);
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
          filter: blur(26px) saturate(135%);
          transform: scale(1.1);
          opacity: 0.95;
          pointer-events: none;
          z-index: 0;
        }
        .company-reference-board::after {
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
        .company-reference-board > * {
          position: relative;
          z-index: 2;
        }
      `}</style>
      <section className="pt-24 md:pt-28 pb-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 section-fade-in">
            <p className="section-eyebrow mb-4" style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.65)', fontSize: '14pt' }}>
              OFFICES
            </p>
            <h1
              className="text-5xl md:text-6xl font-extrabold text-[#FFB347] leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.82)]"
              style={{ WebkitTextStroke: '0.55px rgba(12,35,24,0.45)' }}
            >
              Largest Global Data Collection
              <br />
              Resources Distribution
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(230px,290px)_minmax(0,1fr)_minmax(260px,300px)] gap-6 lg:gap-7 items-stretch company-reference-board rounded-[22px] p-3 sm:p-4 md:p-5">
            <aside className="section-fade-in order-2 lg:order-1 flex flex-col w-full">
              <div className="w-full rounded-2xl border border-[#046241]/35 bg-[linear-gradient(145deg,rgba(245,238,219,0.96),rgba(229,243,236,0.95))] p-3 shadow-xl backdrop-blur-sm">
                <p
                  className="font-black uppercase tracking-[0.14em] text-[#046241]"
                  style={{ fontSize: '11pt' }}
                >
                  Office Panel
                </p>
                <p className="mt-1 text-xs text-[#355146]">Click a location to move the map.</p>

                <div className="mt-3 max-h-[500px] space-y-2 overflow-y-auto pr-1">
                  {sortedOfficeLocations.map((location) => {
                    const isActive = location.originalIndex === activeOfficeIndex;
                    return (
                      <button
                        key={`${location.name}-${location.originalIndex}`}
                        type="button"
                        onClick={() => focusOfficeOnMap(location, location.originalIndex)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition-all duration-300 ${
                          isActive
                            ? 'border-[#FFB347] bg-[#FFB347] shadow-[0_0_0_1px_rgba(255,179,71,0.42)]'
                            : 'border-[#046241]/20 bg-white/70 hover:border-[#FFB347]/60 hover:bg-[#fff4df]'
                        }`}
                      >
                        <p className={`text-sm font-bold ${isActive ? 'text-[#0f2f20]' : 'text-[#046241]'}`}>
                          {location.name}
                        </p>
                        <p className={`mt-0.5 text-xs ${isActive ? 'text-[#2a3730]' : 'text-[#5f7a6f]'}`}>{location.address}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="section-fade-in order-1 lg:order-2 min-w-0 mt-2">
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

            <aside className="section-fade-in order-3 flex flex-col items-center lg:items-stretch w-full max-w-[360px] lg:max-w-none mx-auto">
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
                    <text
                      fill="#0f2f20"
                      fontSize="11.5pt"
                      fontWeight="700"
                      textLength="201"
                      lengthAdjust="spacing"
                      style={{ textRendering: 'geometricPrecision' }}
                    >
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
                    <p className="text-4xl font-extrabold text-dark-serpent mb-2">
                      {(animatedStatValues[idx] || 0).toLocaleString()}
                      {item.suffix}
                    </p>
                    <p className="text-lg font-medium text-dark-serpent">{item.label}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <p className="mt-10 text-lg text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.78)] max-w-4xl section-fade-in">
            Lifewood operates one of the broadest global data collection networks, delivering multilingual and region-specific AI data resources through distributed production centers.
          </p>
        </div>
      </section>
    </div>
  );
};

export default GlobalPresence;
