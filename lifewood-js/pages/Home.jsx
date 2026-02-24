import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientsPartnersSection from '../components/ClientsPartnersSection';

const globalStats = [
  {
    title: '40+ Global Delivery Centers',
    description:
      'Lifewood operates 40+ secure delivery centers worldwide, providing the backbone for AI data operations. These hubs ensure sensitive data is processed in controlled environments, with industrialized workflows and strict compliance standards across all regions.',
    bg: '#F5EEDB',
    text: '#0E5C3A',
  },
  {
    title: '30+ Countries Across All Continents',
    description:
      "Lifewood's global footprint spans 30+ countries and 40+ centers, including extensive operations in Africa, Asia, Europe, and the Americas, enabling region-specific datasets that reflect cultural and linguistic diversity.",
    bg: '#F5B041',
    text: '#0E5C3A',
  },
  {
    title: '50+ Language Capabilities and Dialects',
    description:
      'Lifewood provides data services in 50+ languages and dialects, building diverse multilingual datasets for LLMs, voice AI, and enterprise applications.',
    bg: '#0E5C3A',
    text: '#FFFFFF',
  },
  {
    title: '56,000+ Global Online Resources',
    description:
      'With 56,788 online specialists worldwide, Lifewood mobilizes a flexible workforce for scalable data collection, annotation, and quality assurance, operating 24/7 across regions.',
    bg: '#000000',
    text: '#FFFFFF',
  },
];

const modalities = [
  {
    id: 'text',
    title: 'Text',
    description: 'Collection, labeling, linguistic review, intent mapping, and sentiment interpretation.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    alt: 'Abstract text and token structures for NLP pipelines',
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Capture, segmentation, subtitle generation, event tagging, and quality auditing.',
    image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Stylized video analytics interface and data visualization',
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Collection, classification, polygon annotation, object detection, and visual QA.',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80',
    alt: 'Computer vision and camera-based AI recognition workflow',
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'Collection, transcription, speaker labeling, voice taxonomy, and acoustic validation.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Audio waveform and spectral processing interface',
  },
];

const solutionCards = [
  {
    title: 'Data Validation',
    description:
      'We validate dataset integrity with layered quality controls to improve downstream model reliability.',
    accent: 'dark',
  },
  {
    title: 'Data Collection',
    description:
      'Our teams collect multilingual text, voice, image, and video data across global markets and domains.',
  },
  {
    title: 'Data Acquisition',
    description:
      'Secure ingestion pipelines connect large-scale sources and prepare assets for production workflows.',
  },
  {
    title: 'Data Curation',
    description:
      'We standardize, normalize, and structure raw data into formats optimized for enterprise AI.',
  },
  {
    title: 'Data Annotation',
    description:
      'Specialized annotation teams deliver consistent labels for classical AI, LLM, and multimodal models.',
  },
];

const Home = () => {
  const [activeMetricIndex, setActiveMetricIndex] = useState(0);
  const aiServicesRef = useRef(null);
  const [aiServicesInView, setAiServicesInView] = useState(false);

  useEffect(() => {
    if (!aiServicesRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAiServicesInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(aiServicesRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 home-modern-bg">
      <style>{`
        .home-glass-card {
          border: 1px solid rgba(255, 255, 255, 0.58) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.38)) !important;
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.46);
          backdrop-filter: blur(10px) saturate(125%);
          -webkit-backdrop-filter: blur(10px) saturate(125%);
        }
        .home-glass-card-dark {
          border: 1px solid rgba(255, 255, 255, 0.28) !important;
          box-shadow: 0 18px 34px rgba(4, 30, 20, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px) saturate(125%);
          -webkit-backdrop-filter: blur(10px) saturate(125%);
        }
        .home-glass-frame {
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(8px) saturate(120%);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
        }
      `}</style>
      <section className="relative overflow-hidden flex items-center bg-transparent pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-castleton/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-saffron/20 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-dark-serpent/15 to-transparent" />
          <div className="home-hero-noise absolute inset-0 opacity-40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 section-fade-in">
              <p className="section-eyebrow">Lifewood Data Technology</p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-dark-serpent leading-[1.05] mb-6">
                Global Data Engineering
                <br />
                for Enterprise AI
              </h1>
              <p className="text-base sm:text-xl text-gray-700 max-w-2xl leading-relaxed mb-10">
                We design and operate end-to-end data programs that turn complex raw inputs into trusted, model-ready assets
                for production AI systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 bg-saffron text-white px-9 py-3.5 rounded-full font-bold hover:bg-dark-serpent transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-saffron/25"
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
                <Link
                  to="/create-account"
                  className="inline-flex items-center gap-2 rounded-full border border-castleton/30 bg-gradient-to-r from-white to-paper px-5 py-2 text-castleton font-bold shadow-[0_8px_20px_rgba(4,98,65,0.12)] hover:border-saffron/70 hover:shadow-[0_10px_24px_rgba(255,179,71,0.22)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Apply Now
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-saffron/20 text-castleton text-sm leading-none">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M3 10a1 1 0 011-1h9.59l-2.3-2.29a1 1 0 111.42-1.42l4 4a1 1 0 010 1.42l-4 4a1 1 0 11-1.42-1.42L13.59 11H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 section-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-[#FFC370] border border-[#f0b45b] p-6 shadow-sm hover-lift home-glass-card">
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#FFB347] mb-2">Operational Model</p>
                  <p className="text-2xl font-black text-dark-serpent">Always On</p>
                  <p className="text-sm text-gray-700 mt-2">Continuous delivery cycles with global team coverage.</p>
                </div>
                <div className="rounded-3xl bg-[#FFB347] border border-[#efa242] p-6 shadow-sm hover-lift home-glass-card">
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#FFB347] mb-2">Quality Focus</p>
                  <p className="text-2xl font-black text-[#046241]">Never Off</p>
                  <p className="text-sm text-dark-serpent/85 mt-2">Multi-layer validation to sustain enterprise confidence.</p>
                </div>
                <div className="col-span-2 rounded-3xl border border-[#e8dfc9] bg-[#f5eedb] p-6 shadow-sm hover-lift home-glass-card">
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#FFB347] mb-2">Core Capabilities</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-black leading-snug">Collection, Annotation, Curation, Validation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="section-fade-in">
              <p className="section-eyebrow">About Us</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-dark-serpent leading-tight mb-5">Building Better AI Outcomes Through Better Data</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Lifewood delivers high-precision data engineering services across multilingual and multimodal workflows. Our
                teams combine operational scale with disciplined quality systems to accelerate enterprise AI deployment.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-castleton/30 bg-gradient-to-r from-white to-paper px-5 py-2 text-castleton font-bold shadow-[0_8px_20px_rgba(4,98,65,0.12)] hover:border-saffron/70 hover:shadow-[0_10px_24px_rgba(255,179,71,0.22)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Know Us Better
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-saffron/20 text-castleton text-sm leading-none">+</span>
              </Link>
            </div>
            <div className="section-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="rounded-[2rem] border-0 bg-gradient-to-br from-paper via-[#f7f2e2] to-paper p-7 sm:p-8 shadow-[0_18px_38px_rgba(19,48,32,0.14)] transition-transform duration-300 hover:-translate-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border-0 bg-white p-5 shadow-[0_8px_18px_rgba(19,48,32,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(19,48,32,0.16)]">
                    <p className="text-[0.72rem] text-[#FFB347] uppercase tracking-[0.22em] font-semibold">Delivery Strength</p>
                    <p className="text-[1.95rem] leading-tight font-black text-dark-serpent mt-2">Global at Scale</p>
                  </div>
                  <div className="rounded-2xl border-0 bg-white p-5 shadow-[0_8px_18px_rgba(19,48,32,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(19,48,32,0.16)]">
                    <p className="text-[0.72rem] text-[#FFB347] uppercase tracking-[0.22em] font-semibold">Coverage</p>
                    <p className="text-[1.95rem] leading-tight font-black text-dark-serpent mt-2">Multimodal + Multilingual</p>
                  </div>
                  <div
                    className="sm:col-span-2 rounded-2xl border-0 p-6 shadow-[0_12px_26px_rgba(4,30,20,0.30)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(4,30,20,0.38)]"
                    style={{ background: 'linear-gradient(118deg, #123525 0%, #046241 100%)' }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -right-10 -top-10 w-44 h-44 rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(255,179,71,0.22) 0%, rgba(255,179,71,0) 70%)' }}
                    />
                    <p className="relative text-[0.72rem] text-[#FFB347] uppercase tracking-[0.22em] font-semibold">Business Result</p>
                    <p className="relative text-[1.82rem] leading-tight font-extrabold text-[#f8fcf9] mt-2">Faster model readiness with measurable quality and throughput.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {globalStats.map((item, index) => {
              const isActive = activeMetricIndex === index;

              return (
                <article
                  key={item.title}
                  onMouseEnter={() => setActiveMetricIndex(index)}
                  className="section-fade-in rounded-[20px] p-7 border border-black/10 overflow-hidden cursor-pointer home-glass-frame"
                  style={{
                    animationDelay: `${index * 0.08}s`,
                    backgroundColor: item.bg,
                    color: item.text,
                    maxHeight: isActive ? '188px' : '96px',
                    transition: 'max-height 400ms ease-in-out, box-shadow 400ms ease-in-out',
                    boxShadow: isActive ? '0 18px 40px rgba(0, 0, 0, 0.18)' : '0 8px 18px rgba(0, 0, 0, 0.10)',
                  }}
                >
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{ color: item.text }}>
                      {item.title}
                    </h3>
                  </div>

                  {isActive && (
                    <p className="mt-4 text-base leading-relaxed" style={{ color: item.text }}>
                      {item.description}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ClientsPartnersSection />

      <section className="ai-projects-section py-20 md:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 md:mb-14 section-fade-in">
            <h3 className="mb-4">
              <span className="inline-flex flex-wrap items-center gap-2 text-[0.72rem] sm:text-[0.78rem] font-extrabold uppercase tracking-[0.16em] text-[#2e7d57]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f2a33a]" aria-hidden="true" />
                <span className="leading-none">Constant Innovation . Unlimited Possibilities</span>
              </span>
            </h3>
            <h2 className="ai-projects-title text-4xl sm:text-6xl font-extrabold text-dark-serpent leading-tight mb-5">
              AI Data Projects at Scale
            </h2>
            <p className="ai-projects-copy text-gray-700 max-w-3xl">
              We build execution frameworks that adapt quickly to changing scope while maintaining consistent quality targets.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)] gap-5 lg:gap-6 items-stretch">
            <article className="ai-delivery-card rounded-[2.2rem] p-8 sm:p-10 section-fade-in relative overflow-hidden">
              <div className="ai-delivery-backdrop" aria-hidden="true" />
              <img
                src="https://framerusercontent.com/images/EfuuWuqk2ibqcvZK8Q4ZM59MgsQ.jpeg?height=853&width=1280"
                alt=""
                aria-hidden="true"
                className="ai-delivery-photo ai-delivery-photo-main"
                loading="lazy"
              />
              <img
                src="https://framerusercontent.com/images/sNxmbNlbSdjE4PpCqPIEhhq1z8w.png?height=1892&width=3362"
                alt=""
                aria-hidden="true"
                className="ai-delivery-photo ai-delivery-photo-secondary"
                loading="lazy"
              />
              <span className="ai-delivery-float ai-delivery-float-a" aria-hidden="true" />
              <span className="ai-delivery-float ai-delivery-float-b" aria-hidden="true" />
              <div className="relative z-10 max-w-3xl">
                <p className="text-saffron text-xs uppercase tracking-[0.22em] font-bold mb-4">Delivery Framework</p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">Comprehensive AI Program Execution</h3>
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                From requirement mapping to operational handover, we align data, quality controls, and governance with your model
                roadmap.
                </p>
                <Link
                  to="/services/ai-model-training"
                  className="ai-delivery-btn inline-flex items-center justify-center bg-saffron text-dark-serpent px-7 py-3.5 rounded-full font-bold hover:bg-earth-yellow transition-colors"
                >
                  View AI Projects
                </Link>
              </div>
            </article>
            <div className="space-y-5">
              <article className="ai-side-card rounded-3xl bg-white border border-gray-100 p-6 shadow-sm section-fade-in home-glass-card" style={{ animationDelay: '0.08s' }}>
                <div className="flex items-start gap-4">
                  <span className="ai-side-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                      <path d="M4 7h10M4 12h16M4 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="16.5" cy="7" r="2.3" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="10.5" cy="17" r="2.3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                  <div>
                    <p className="ai-side-label">Execution Model</p>
                    <p className="ai-side-title text-2xl font-black">Agile + Controlled</p>
                  </div>
                </div>
              </article>
              <article className="ai-side-card rounded-3xl bg-white border border-gray-100 p-6 shadow-sm section-fade-in home-glass-card" style={{ animationDelay: '0.16s' }}>
                <div className="flex items-start gap-4">
                  <span className="ai-side-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M3.6 18.2c.9-2.3 2.8-3.6 4.4-3.6 1.6 0 3.5 1.3 4.4 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      <rect x="14" y="5.2" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M15.5 9h3.5M17.2 7.3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="ai-side-label">Quality Layer</p>
                    <p className="ai-side-title text-2xl font-black">Human + AI Review</p>
                  </div>
                </div>
              </article>
              <article className="ai-side-card rounded-3xl bg-white border border-gray-100 p-6 shadow-sm section-fade-in home-glass-card" style={{ animationDelay: '0.24s' }}>
                <div className="flex items-start gap-4">
                  <span className="ai-side-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                      <path d="M13 4l-5.6 7h3.8L9.8 20l6.8-9h-3.6L13 4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="ai-side-label">Speed to Production</p>
                    <p className="ai-side-title text-2xl font-black">Faster Model Readiness</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section ref={aiServicesRef} className="py-20 md:py-24 bg-transparent ai-services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-10 ai-services-head ${aiServicesInView ? 'is-visible' : ''}`}>
            <p className="section-eyebrow">AI Services</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-dark-serpent leading-tight mb-4">Comprehensive Data Solutions</h2>
            <p className="text-gray-600 max-w-3xl">
              Structured services across text, video, image, and audio pipelines to support model development, evaluation, and
              deployment.
            </p>
          </div>

          <div className={`ai-services-mosaic ${aiServicesInView ? 'is-visible' : ''}`}>
            {modalities.map((item, idx) => (
              <article
                key={item.id}
                className={`ai-service-tile ai-service-tile-${item.id}`}
                style={{ '--tile-delay': `${idx * 95}ms` }}
                tabIndex={0}
                role="group"
                aria-label={`${item.title} AI data service`}
              >
                <img src={item.image} alt={item.alt} loading="lazy" />
                <div className="ai-service-overlay" aria-hidden="true" />
                <div className="ai-service-content">
                  <p className="ai-service-kicker">AI {item.title}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;



