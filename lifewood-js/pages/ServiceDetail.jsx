import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { SERVICES_DATA } from '../constants';
import CircularGallery from '../components/CircularGallery';

const TYPE_SERVICE_CONFIGS = {
  'type-a-data-servicing': {
    heroTitleLines: ['Type A -', 'Data Servicing'],
    contactButtonStyle: 'internal-news',
    heroDescription:
      'End-to-end data services specializing in multi-language datasets, including document capture, data collection and preparation, extraction, cleaning, labeling, annotation, quality assurance, and formatting.',
    heroFootnotes: [
      'Multi-language genealogy documents, newspapers, and archives to facilitate global ancestry research',
      'QQ Music of over millions non-Chinese songs and lyrics',
    ],
    sectionTitle: 'TYPE A- DATA SERVICING',
    heroVisual: 'blobs',
    slides: [
      {
        step: '01',
        tab: 'Objective',
        title: 'Objective',
        description: 'Scan document for preservation, extract data and structure into database.',
        image: 'https://framerusercontent.com/images/1edPwLJhGXCUhlh38ixQSMOTFA.png?width=1024&height=1024',
      },
      {
        step: '02',
        tab: 'Key Features',
        title: 'Key Features',
        description:
          'Features include Auto Crop, Auto De-skew, Blur Detection, Foreign Object Detection, and AI Data Extraction.',
        image: 'https://framerusercontent.com/images/m7OC7BU1eSVf04CkU0jmNPRkf8.png?width=1024&height=1024',
      },
      {
        step: '03',
        tab: 'Results',
        title: 'Results',
        description:
          'Accurate and precise data is ensured through validation and quality assurance. The system is efficient and scalable, enabling fast and adaptable data extraction. It supports multiple languages and formats, allowing the handling of diverse documents. Advanced features include auto-crop, de-skew, blur, and object detection. With AI integration, the solution provides structured data for AI tools and delivers clear, visual, and easy-to-understand results.',
        image: 'https://framerusercontent.com/images/iI5MBUQ9ctQdcDHjCLNvD4j4kxc.png?width=1024&height=1024',
      },
    ],
  },
  'type-b-horizontal-llm-data': {
    heroTitleLines: ['Type B -', 'Horizontal LLM Data'],
    contactButtonStyle: 'internal-news',
    heroDescription:
      'Comprehensive AI data solutions that cover the entire spectrum from data collection and annotation to model testing. Creating multimodal datasets for deep learning and large language models.',
    heroFootnotes: [
      'Voice, image and text for Apple Intelligence',
      'Provided over 50 language sets',
    ],
    sectionTitle: 'TYPE B- HORIZONTAL LLM DATA',
    heroVisual: 'cards',
    slides: [
      {
        step: '01',
        tab: 'Target',
        title: 'Target',
        description:
          'Capture and transcribe recordings from native speakers from 23 different countries (Netherlands, Spain, Norway, France, Germany, Poland, Russia, Italy, Japan, South Korea, Mexico, UAE, Saudi Arabia, Egypt, etc.). Voice content involves 6 project types and 9 data domains with a total of 25,400 valid hours.',
        image: 'https://framerusercontent.com/images/2GAiSbiawE1R7sXuFDwNLfEovRM.jpg?height=400&width=711',
      },
      {
        step: '02',
        tab: 'Solutions',
        title: 'Solutions',
        description:
          '30,000+ native speaking human resources from more than 30 countries were mobilized. Flexible industrial processes were continuously optimized, with PBI used to track collection and transcription progress in real time.',
        image: 'https://framerusercontent.com/images/AtSZKyVin3X5lENphObnH6Puw.jpg?height=408&lossless=1&width=612',
      },
      {
        step: '03',
        tab: 'Results',
        title: 'Results',
        description:
          'Completed voice collection and annotation of 25,400 valid hours within 5 months, on time and with quality.',
        image: 'https://framerusercontent.com/images/prEubFztlVx6VnuokfOrkAs.jpg?height=353&width=612',
      },
    ],
  },
  'type-c-vertical-llm-data': {
    heroTitleLines: ['Type C -', 'Vertical LLM Data'],
    contactButtonStyle: 'internal-news',
    heroDescription:
      'AI data solutions across specific industry verticals including autonomous driving data annotation, in-vehicle data collection and specialized data services for industry, enterprise or private LLM.',
    heroFootnotes: [
      'Autonomous driving and Smart cockpit datasets for Driver Monitoring System',
      'China Merchants Group: Enterprise-grade dataset for building "ShipGPT"',
    ],
    sectionTitle: 'TYPE C- VERTICAL LLM DATA',
    heroVisual: 'cards',
    slides: [
      {
        step: '01',
        tab: 'Target',
        title: 'Target',
        description:
          'Annotate vehicles, pedestrians, and road objects with 2D and 3D techniques to enable accurate object detection for autonomous driving. Self-driving cars rely on precise visual training to detect, classify, and respond safely in real-world conditions.',
        image: 'https://framerusercontent.com/images/9KyWAYBvYkUbASCckXa16Fgc.jpg?height=3024&width=4032',
      },
      {
        step: '02',
        tab: 'Solutions',
        title: 'Solutions',
        description:
          'Dedicated Process Engineering teams support analysis and optimization with AI-enhanced workflows, multi-level quality checks, and scalable global delivery through managed crowdsourced operations.',
        image: 'https://framerusercontent.com/images/mqqWNbBnY0EOUvSMgGlDain8M.jpg?height=591&width=1004',
      },
      {
        step: '03',
        tab: 'Results',
        title: 'Results',
        description:
          'Achieved 25% production in Month 1 with 95% accuracy (Target: 90%) and 50% production in Month 2 with 99% accuracy (Target: 95%). Maintained 99% overall accuracy with on-time delivery and scaled operations to Malaysia and Indonesia.',
        image: 'https://framerusercontent.com/images/GhKqWw4urSIcFZGZ3kWTXG7c.png?height=1024&width=1536',
      },
    ],
  },
  'type-d-aigc': {
    heroTitleLines: ['Type D -', 'AI Generated Content (AIGC)'],
    contactButtonStyle: 'internal-news',
    heroDescription:
      "Lifewood's early adoption of AI tools has rapidly evolved AI generated content integrated into video production. These text, voice, image and video skills, combined with traditional production methods and story development, now support global brand communication.",
    heroFootnotes: [
      'We can quickly adjust the culture and language of your video to suit different world markets',
      'Multiple languages with content execution across 100+ countries',
    ],
    sectionTitle: 'TYPE D- AI GENERATED CONTENT (AIGC)',
    heroVisual: 'cards',
    slides: [
      {
        step: '01',
        tab: 'Approach',
        title: 'Our Approach',
        description:
          'Our motivation is to express your brand personality in a compelling and distinctive way. We specialize in story-driven content for companies joining the communication revolution.',
        image: 'https://framerusercontent.com/images/8USU1OFCcARiIIvcdJBJlzA8EA4.jpg?height=3456&width=5184',
      },
      {
        step: '02',
        tab: 'Solutions',
        title: 'Solutions',
        description:
          'We use advanced film, video and editing techniques, combined with generative AI, to create cinematic worlds for videos, advertisements and corporate communications.',
        image: 'https://framerusercontent.com/images/3CdZeNunHzqH9P7TcEFjG2Imb4.jpg?height=6000&width=4000',
      },
      {
        step: '03',
        tab: 'Results',
        title: 'Results',
        description:
          'Campaigns are localized quickly by adapting culture and language for target markets, supporting multilingual creative delivery across more than 100 countries with originality and clarity.',
        image: 'https://framerusercontent.com/images/pW4xMuxSlAXuophJZT96Q4LO0.jpeg?height=386&width=800',
      },
    ],
  },
};

const AI_INITIATIVE_CONFIGS = {
  'data-annotation': {
    pageLabel: 'AI DATA SERVICES',
    intro:
      'Comprehensive AI data solutions that cover the entire spectrum from data collection and annotation to model testing. Creating multimodal datasets for deep learning and large language models.',
    highlightTitle: 'Comprehensive Data Solutions',
    highlightSubtitle: 'Why brands trust us',
    heroImages: [
      'https://framerusercontent.com/images/ZywE1VmIeWyUjcGlRI6E373zLc.png?height=791&width=668',
      'https://framerusercontent.com/images/jUxjMEIesCVLrVzTOoqyk8g8is.png?height=330&width=736',
      'https://framerusercontent.com/images/MUgrrLByNsvKb575zwtrYhrmFZA.png?height=284&width=190',
    ],
    modalities: [
      {
        title: 'Text',
        description:
          'Text collection, labelling, transcription, utterance collection, and sentiment analysis.',
      },
      {
        title: 'Video',
        description:
          'Video collection, segmentation, annotation, subtitle generation, and quality review.',
      },
      {
        title: 'Image',
        description:
          'Image collection, classification, object detection, polygon tagging, and validation.',
      },
      {
        title: 'Audio',
        description:
          'Audio collection, transcription, speaker labeling, taxonomy mapping, and QA.',
      },
    ],
    cards: [
      {
        title: 'Data Validation',
        description:
          'We rigorously check dataset consistency and quality with layered verification.',
        image: 'https://framerusercontent.com/images/G5K30xhg1tNClxPKOpzk5EoQ.jpg?height=403&width=629',
      },
      {
        title: 'Data Collection',
        description:
          'Global teams gather multilingual text, audio, image, and video data at scale.',
        image: 'https://framerusercontent.com/images/RIqv6SVZxMioe4xDr5l6jkvJgeQ.jpg?height=587&width=901',
      },
      {
        title: 'Data Acquisition',
        description:
          'Secure ingestion pipelines connect large data sources for production workflows.',
        image: 'https://framerusercontent.com/images/pNWAyk3VybQhYufnd9kc6RSOcM.png?height=800&width=1536',
      },
      {
        title: 'Data Curation',
        description:
          'Raw data is cleaned, standardized, and structured into model-ready formats.',
        image: 'https://framerusercontent.com/images/SAGfqf3mkOEFooPykUvG5BDmRXU.png?height=933&width=1200',
      },
      {
        title: 'Data Annotation',
        description:
          'Expert annotation workflows deliver accurate labels for AI and LLM training.',
        image: 'https://framerusercontent.com/images/RLhJxXs7PhKcWxLmeYiVRqEtPxY.png?height=2464&width=1856',
      },
    ],
  },
  'ai-model-training': {
    pageLabel: 'AI Projects',
    intro:
      'From building AI datasets in diverse languages to deploying models tailored for specific industries, our AI projects transform data into innovation.',
    highlightTitle: 'Projects',
    highlightSubtitle: 'What we currently handle',
    heroImages: [
      'https://framerusercontent.com/images/G5K30xhg1tNClxPKOpzk5EoQ.jpg?height=403&width=629',
      'https://framerusercontent.com/images/RIqv6SVZxMioe4xDr5l6jkvJgeQ.jpg?height=587&width=901',
      'https://framerusercontent.com/images/pNWAyk3VybQhYufnd9kc6RSOcM.png?height=800&width=1536',
    ],
    projects: [
      {
        id: '2.1',
        title: 'AI Data Extraction',
        description:
          'Using AI to process and classify large volumes of unstructured data from text, audio, and images, then convert it into structured, actionable insights.',
        image: 'https://framerusercontent.com/images/SAGfqf3mkOEFooPykUvG5BDmRXU.png?height=933&width=1200',
      },
      {
        id: '2.2',
        title: 'Machine Learning Enablement',
        description:
          'Data preparation, annotation, and quality assurance for supervised and unsupervised learning models.',
        image: 'https://framerusercontent.com/images/RLhJxXs7PhKcWxLmeYiVRqEtPxY.png?height=2464&width=1856',
      },
      {
        id: '2.3',
        title: 'Autonomous Driving Technology',
        description:
          '2D, 3D, and 4D data collection and annotation for autonomous driving and smart cockpit systems.',
        image: 'https://framerusercontent.com/images/pNWVDlqhjIHcfYKBIPfIJUVFR8.png?height=2464&width=1856',
      },
      {
        id: '2.4',
        title: 'AI-Enabled Customer Service',
        description:
          'NLP-based chatbots and virtual assistants that improve support quality and operational efficiency.',
        image: 'https://framerusercontent.com/images/G5K30afUvHfBC3i1tImiTDBVjg.png?height=2464&width=1856',
      },
      {
        id: '2.5',
        title: 'Natural Language Processing and Speech Acquisition',
        description:
          'Large-scale multilingual speech and text datasets used for translation, sentiment analysis, and conversational AI.',
        image: 'https://framerusercontent.com/images/RIqv6T7aFrp5Q9X85Zqy55KQ8x4.png?height=2464&width=1856',
      },
      {
        id: '2.6',
        title: 'Computer Vision (CV)',
        description:
          'Visual AI systems for object detection, facial recognition, and image understanding across sectors.',
        image: 'https://framerusercontent.com/images/SAGfqf3mkOEFooPykUvG5BDmRXU.png?height=933&width=1200',
      },
      {
        id: '2.7',
        title: 'Genealogy',
        description:
          'Digitization and interpretation of historical records for family history and ancestry research.',
        image: 'https://framerusercontent.com/images/RLhJxXs7PhKcWxLmeYiVRqEtPxY.png?height=2464&width=1856',
      },
    ],
  },
};

const TypeServiceDetail = ({ config }) => {
  const slides = config.slides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFeatureHovering, setIsFeatureHovering] = useState(false);
  const useInternalNewsCta = config.contactButtonStyle === 'internal-news';

  useEffect(() => {
    if (isFeatureHovering) return undefined;

    const autoplay = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(autoplay);
  }, [isFeatureHovering, slides.length]);

  const activeSlide = slides[activeIndex];
  const isResultsActive = activeSlide.step === '03';
  const leftSlides = slides.slice(0, activeIndex);
  const rightSlides = slides.slice(activeIndex + 1);
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  return (
    <div className="animate-in fade-in duration-700 home-modern-bg">
      <style>{`
        @keyframes typeAFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typeAFloatOne {
          0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(8px, -14px, 0) rotate(8deg) scale(1.04); }
          50% { transform: translate3d(0, -24px, 0) rotate(12deg) scale(1.08); }
          75% { transform: translate3d(-10px, -10px, 0) rotate(4deg) scale(1.03); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
        }
        @keyframes typeAFloatTwo {
          0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(-12px, 12px, 0) rotate(-8deg) scale(1.03); }
          50% { transform: translate3d(0, 24px, 0) rotate(-12deg) scale(1.08); }
          75% { transform: translate3d(10px, 10px, 0) rotate(-5deg) scale(1.04); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
        }
        .type-a-enter {
          animation: typeAFadeUp 460ms ease both;
        }
        .type-a-shape {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          will-change: transform;
        }
        .type-a-shape-one {
          animation: typeAFloatOne 3.4s ease-in-out infinite;
        }
        .type-a-shape-two {
          animation: typeAFloatTwo 3.8s ease-in-out infinite;
        }
        .type-a-shape-three {
          animation: typeAFloatOne 4.2s ease-in-out infinite;
        }
        .type-hero-card {
          position: absolute;
          border-radius: 1.15rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.3);
        }
        .type-hero-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .type-hero-card-a {
          left: 2%;
          top: 10%;
          width: 48%;
          height: 58%;
          animation: typeAFloatOne 3.6s ease-in-out infinite;
        }
        .type-hero-card-b {
          right: 4%;
          top: 3%;
          width: 40%;
          height: 50%;
          animation: typeAFloatTwo 4.1s ease-in-out infinite;
        }
        .type-hero-card-c {
          right: 13%;
          bottom: 0;
          width: 50%;
          height: 56%;
          animation: typeAFloatOne 4.6s ease-in-out infinite;
        }
        .type-a-feature-media {
          max-width: 620px;
          aspect-ratio: 16 / 10;
        }
        @media (min-width: 1024px) {
          .type-a-feature-grid {
            grid-template-columns: 220px auto minmax(0, 620px) auto;
            height: 360px;
            max-height: 360px;
            overflow: hidden;
          }
          .type-a-feature-copy {
            height: 360px;
            max-height: 360px;
            overflow: hidden;
          }
          .type-a-feature-media {
            height: 100%;
            max-height: 360px;
          }
          .type-a-feature-labels {
            height: 100%;
            max-height: 360px;
            align-items: stretch;
            overflow: hidden;
          }
          .type-a-feature-label-btn {
            height: 100%;
            max-height: 360px;
          }
        }
      `}</style>

      <section className="pt-24 pb-14 md:pt-28 md:pb-20 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-eyebrow">Lifewood Data Technology</p>

          <div className="relative overflow-hidden rounded-[22px] bg-[#ddd6c3] p-7 sm:p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="type-a-enter relative z-10">
                <h1 className="text-4xl sm:text-5xl font-bold leading-[1.04] text-[#111] mb-4">
                  {config.heroTitleLines[0]}
                  <br />
                  {config.heroTitleLines[1]}
                </h1>
                <p className="text-[15px] leading-7 text-[#202020] max-w-xl mb-6">
                  {config.heroDescription}
                </p>
                {useInternalNewsCta ? (
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
                ) : (
                  <Link
                    to="/contact"
                    className="contact-us-glow inline-flex items-center rounded-[10px] bg-[#ffb347] pl-4 pr-1 py-1.5 text-[13px] font-bold text-dark-serpent"
                  >
                    Contact Us
                    <span className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#046241] text-white text-lg">
                      &rarr;
                    </span>
                  </Link>
                )}
              </div>

              {config.heroVisual === 'blobs' ? (
                <div className="relative h-[260px] sm:h-[320px] md:h-[360px]">
                  <div className="absolute right-[4%] top-[2%] h-28 w-28 sm:h-32 sm:w-32">
                    <img
                      src="https://framerusercontent.com/images/Es0UNVEZFUO6pTmc3NI38eovew.png?height=1600&width=1600"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="type-a-shape type-a-shape-one"
                    />
                  </div>
                  <div className="absolute right-[34%] top-[15%] h-28 w-28 sm:h-32 sm:w-32">
                    <img
                      src="https://framerusercontent.com/images/Tq3lgO9Qy66CFuDaYW99KQ5xoLM.png?height=2040&width=2040"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="type-a-shape type-a-shape-two"
                    />
                  </div>
                  <div className="absolute right-[14%] top-[40%] h-36 w-36 sm:h-44 sm:w-44">
                    <img
                      src="https://framerusercontent.com/images/LFAxsa4CpX7e4qBI72ijOV2sHg.png?height=1600&width=1600"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="type-a-shape type-a-shape-three"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative h-[260px] sm:h-[320px] md:h-[360px]">
                  <div className="type-hero-card type-hero-card-a">
                    <img src={slides[0].image} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <div className="type-hero-card type-hero-card-b">
                    <img src={slides[1].image} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <div className="type-hero-card type-hero-card-c">
                    <img src={slides[2].image} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-[14px] leading-7 text-[#242424] max-w-5xl">
            {config.heroFootnotes[0]}
            {config.heroFootnotes[1] && (
              <>
                <br />
                {config.heroFootnotes[1]}
              </>
            )}
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3a3a3a] uppercase">
            {config.sectionTitle}
          </h2>

          <div className="mt-8 mx-auto w-full max-w-[1030px] rounded-[24px] bg-[#efefef] p-5 sm:p-6 md:p-7 overflow-hidden">
            <div className="type-a-feature-grid grid grid-cols-1 gap-5 md:gap-6 lg:gap-4 items-end justify-center overflow-hidden">
              <div className="type-a-feature-copy type-a-enter flex flex-col justify-end" key={`copy-${activeSlide.step}`}>
                <h4 className="text-[34px] leading-none font-semibold text-[#2f2f2f] mb-3">{activeSlide.title}</h4>
                <p
                  className={`text-[#4a4a4a] ${
                    isResultsActive
                      ? 'text-[14px] leading-6 max-h-[190px] overflow-y-auto pr-1'
                      : 'text-[15px] leading-7'
                  }`}
                >
                  {activeSlide.description}
                </p>
              </div>

              <div
                className="type-a-feature-labels hidden lg:flex self-stretch items-stretch"
                onMouseEnter={() => setIsFeatureHovering(true)}
                onMouseLeave={() => setIsFeatureHovering(false)}
              >
                {leftSlides.map((slide) => (
                  <button
                    key={`left-${slide.step}`}
                    type="button"
                    onClick={() => setActiveIndex(slides.findIndex((item) => item.step === slide.step))}
                    onMouseEnter={() => setActiveIndex(slides.findIndex((item) => item.step === slide.step))}
                    onFocus={() => setActiveIndex(slides.findIndex((item) => item.step === slide.step))}
                    className="type-a-feature-label-btn h-full px-1 border-l border-gray-300 text-gray-400 hover:text-gray-500 transition-colors"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    <span className="text-[12px] tracking-[0.14em] font-semibold uppercase whitespace-nowrap">
                      {slide.step} {slide.tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="type-a-feature-media relative w-full min-h-[250px] sm:min-h-[300px]">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous"
                  className="hidden md:inline-flex absolute left-2 top-2 z-20 h-8 w-8 items-center justify-center rounded-full text-gray-300 hover:text-gray-500 transition-colors"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next"
                  className="hidden md:inline-flex absolute right-2 top-2 z-20 h-8 w-8 items-center justify-center rounded-full text-gray-300 hover:text-gray-500 transition-colors"
                >
                  &rarr;
                </button>

                <div className="type-a-enter absolute inset-0 rounded-[24px] overflow-hidden" key={`image-${activeSlide.step}`}>
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-3 right-3 rounded-[22px] bg-white/95 px-4 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.16)]">
                  <p className="text-[42px] leading-none font-light text-[#2f2f2f]">{activeSlide.step}</p>
                  <p className="text-xs font-semibold text-[#2f2f2f]">{activeSlide.tab}</p>
                </div>
              </div>

              <div
                className="type-a-feature-labels hidden lg:flex self-stretch items-stretch"
                onMouseEnter={() => setIsFeatureHovering(true)}
                onMouseLeave={() => setIsFeatureHovering(false)}
              >
                {rightSlides.map((slide) => (
                  <button
                    key={`right-${slide.step}`}
                    type="button"
                    onClick={() => setActiveIndex(slides.findIndex((item) => item.step === slide.step))}
                    onMouseEnter={() => setActiveIndex(slides.findIndex((item) => item.step === slide.step))}
                    onFocus={() => setActiveIndex(slides.findIndex((item) => item.step === slide.step))}
                    className="type-a-feature-label-btn h-full px-1 border-l border-gray-300 text-gray-400 hover:text-gray-500 transition-colors"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    <span className="text-[12px] tracking-[0.14em] font-semibold uppercase whitespace-nowrap">
                      {slide.step} {slide.tab}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`mobile-${slide.step}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] border transition-colors ${
                      isActive
                        ? 'bg-[#2f2f2f] text-white border-[#2f2f2f]'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {slide.step} {slide.tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const AIInitiativeDetail = ({ config }) => {
  const solutionCardFallbackImages = [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  ];
  const heroFallbackImages = solutionCardFallbackImages.slice(0, 3);
  const projectTextItems = [
    {
      image: '/images/project1.jpg',
      text: '2.1 AI Data Extraction',
      description:
        'Using AI, we optimize the acquisition of image and text from multiple sources. Techniques include onsite scanning, drone photography, negotiation with archives and the formation of alliances with corporations, religious organizations and governments.',
    },
    {
      image: '/images/project2.jpg',
      text: '2.2 Machine Learning Enablement',
      description:
        'From simple data to deep learning, our data solutions are highly flexible and can enable a wide variety of ML systems, no matter how complex the model.',
    },
    {
      image: '/images/project3.jpg',
      text: '2.3 Autonomous Driving Technology',
      description:
        'Our expertise in precision data labelling lays the groundwork for AI, so that it can process and adapt to the complexities of real-world conditions. We have implemented a diverse mapping methodology, that employs a wide range of data types, including 2D and 3D models, and combinations of both, to create a fully visualized cognitive driving system. Millions of images, videos and mapping data were annotated, effectively transitioning this technology from theoretical models to real-world applications - a significant leap forward for autonomous transport. Lifewood remains at the forefront of this technology, pioneering the evolution of safe, efficient autonomous driving solutions.',
    },
    {
      image: '/images/project4.jpg',
      text: '2.4 AI-Enabled Customer Service',
      description:
        'AI-enabled customer service is now the quickest and most effective route for institutions to deliver personalized, proactive experiences that drive customer engagement. AI powered services can increase customer engagement, multiplying cross-sell and upsell opportunities. Guided by our experts AI customer service can transform customer relationships creating an improved cycle of service, satisfaction and increased customer engagement.',
    },
    {
      image: '/images/project5.jpg',
      text: '2.5 Natural Language Processing and Speech Acquisition',
      description:
        "We have partnered with some of the world's most advanced companies in NLP development. With a managed workforce that spans the globe, we offer solutions in over 50 language capabilities and can assess various dialects and accents for both text and audio data. We specialize in collecting and transcribing recordings from native speakers. This has involved tens of thousands of conversations, a scale made possible by our expertise in adapting industrial processes and our integration with AI.",
    },
    {
      image: '/images/project6.jpg',
      text: '2.6 Computer Vision (CV)',
      description:
        'Training AI to see and understand the world requires a high volume of quality training data. Lifewood provides total data solutions for your CV development from collection to annotation to classification and more, for video and image datasets enabling machines to interpret visual information. We have experience in a wide variety of applications including autonomous vehicles, farm monitoring, face recognition and more.',
    },
    {
      image: '/images/project7.jpg',
      text: '2.7 Genealogy',
      description:
        'Powered by AI, Lifewood processes genealogical material at speed and scale, to conserve and illuminate family histories, national archives, corporate lists and records of all types. Lifewood has more than 18 years of experience capturing, scanning and processing genealogical data. In fact, Lifewood started with genealogy data as its core business, so that over the years we have accumulated vast knowledge in diverse types of genealogy indexing. We have worked with all the major genealogy companies and have extensive experience in transcribing and indexing genealogical content in a wide variety of formats, including tabular, pre-printed forms and paragraph-style records. Working across borders, with offices on every continent, our ability with multi-language projects has built an extensive capability spanning more than 50 languages and associated dialects. Now, powered by AI and the latest inter-office communication systems, we are transforming ever more efficient ways to service our clients, while keeping humanity at the centre of our activity. Genealogical material that we have experience with includes: Census, Vital - BMD, Church and Parish Registers, Passenger Lists, Naturalisation, Military Records, Legal Records, Yearbooks.',
    },
  ];
  const projectItems = projectTextItems.map((item, idx) => ({
    image: config.projects?.[idx]?.image || item.image,
    text: item.text,
    description: item.description || '',
    kicker: 'AI PROJECT',
  }));

  return (
    <div className="animate-in fade-in duration-700 home-modern-bg">
      <style>{`
        @keyframes aiInitiativeRise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes aiInitiativeFloatA {
          0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(5px, -10px, 0) rotate(1.2deg) scale(1.01); }
          50% { transform: translate3d(2px, -18px, 0) rotate(1.8deg) scale(1.02); }
          75% { transform: translate3d(-4px, -9px, 0) rotate(0.8deg) scale(1.01); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
        }
        @keyframes aiInitiativeFloatB {
          0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(-6px, -8px, 0) rotate(-1.4deg) scale(1.01); }
          50% { transform: translate3d(-3px, -20px, 0) rotate(-2deg) scale(1.02); }
          75% { transform: translate3d(4px, -11px, 0) rotate(-0.9deg) scale(1.01); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
        }
        @keyframes aiInitiativeFloatC {
          0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(4px, -9px, 0) rotate(1deg) scale(1.01); }
          50% { transform: translate3d(1px, -16px, 0) rotate(1.6deg) scale(1.02); }
          75% { transform: translate3d(-3px, -7px, 0) rotate(0.7deg) scale(1.01); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
        }
        .ai-initiative-enter {
          animation: aiInitiativeRise 420ms ease both;
        }
        .ai-initiative-shell {
          border: 1px solid rgba(255, 255, 255, 0.46);
          background: rgba(221, 214, 195, 0.78);
          box-shadow: 0 24px 46px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.42);
          backdrop-filter: blur(12px) saturate(130%);
          -webkit-backdrop-filter: blur(12px) saturate(130%);
        }
        .ai-initiative-hero-card {
          border: 1px solid rgba(255, 255, 255, 0.58);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 32px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(8px) saturate(125%);
          -webkit-backdrop-filter: blur(8px) saturate(125%);
          will-change: transform;
        }
        .ai-initiative-hero-card-a {
          animation: aiInitiativeFloatA 3.6s ease-in-out infinite;
        }
        .ai-initiative-hero-card-b {
          animation: aiInitiativeFloatB 3.9s ease-in-out 0.25s infinite;
        }
        .ai-initiative-hero-card-c {
          animation: aiInitiativeFloatC 3.7s ease-in-out 0.12s infinite;
        }
        @keyframes aiInitiativeGlassSheen {
          0%, 26% {
            transform: translateX(-70%) rotate(10deg);
            opacity: 0;
          }
          36% {
            opacity: 0.58;
          }
          54% {
            transform: translateX(72%) rotate(10deg);
            opacity: 0;
          }
          100% {
            transform: translateX(72%) rotate(10deg);
            opacity: 0;
          }
        }
        .ai-initiative-glass-card {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.56);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.36));
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(11px) saturate(130%);
          -webkit-backdrop-filter: blur(11px) saturate(130%);
          overflow: hidden;
        }
        .ai-initiative-glass-card::after {
          content: '';
          position: absolute;
          inset: -115% -40%;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.42) 50%,
            rgba(255, 255, 255, 0) 60%
          );
          transform: translateX(-70%) rotate(10deg);
          animation: aiInitiativeGlassSheen 7.2s ease-in-out infinite;
          pointer-events: none;
        }
        .ai-initiative-glass-card > * {
          position: relative;
          z-index: 1;
        }
        @keyframes aiInitiativeMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.5rem)); }
        }
        .ai-initiative-marquee-wrap {
          overflow: hidden;
          padding-inline: 0.75rem;
          mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
        }
        .ai-initiative-marquee-track {
          display: flex;
          width: max-content;
          gap: 1rem;
          animation: aiInitiativeMarquee 10s linear infinite;
          will-change: transform;
        }
        .ai-initiative-marquee-group {
          display: flex;
          gap: 1rem;
          align-items: stretch;
        }
        .ai-initiative-marquee-card {
          width: min(280px, calc(100vw - 3.5rem));
          flex: 0 0 auto;
          min-height: 128px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .ai-initiative-marquee-card.ai-initiative-glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
          border-color: rgba(255, 255, 255, 0.72);
          box-shadow: 0 14px 24px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.56);
        }
        .ai-initiative-marquee-card.ai-initiative-glass-card::after {
          opacity: 0.45;
          animation-duration: 10.5s;
        }
        .ai-initiative-solution-card {
          min-height: 288px;
          display: flex;
          flex-direction: column;
          transition: transform 320ms ease, box-shadow 320ms ease;
        }
        .ai-initiative-solution-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 30px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.56);
        }
        @keyframes aiInitiativeSolutionMediaDrift {
          0% { transform: scale(1) translate3d(0, 0, 0); }
          50% { transform: scale(1.03) translate3d(0, -2px, 0); }
          100% { transform: scale(1) translate3d(0, 0, 0); }
        }
        @keyframes aiInitiativeSolutionOverlayPulse {
          0%, 100% { opacity: 0.52; }
          50% { opacity: 0.34; }
        }
        .ai-initiative-solution-media {
          position: relative;
          height: 104px;
          margin-bottom: 1rem;
          border-radius: 0.85rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.56);
          background: rgba(255, 255, 255, 0.34);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42);
        }
        .ai-initiative-solution-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.85) contrast(0.94) brightness(0.95);
          animation: aiInitiativeSolutionMediaDrift 9s ease-in-out infinite;
          animation-delay: var(--solution-delay, 0ms);
          transition: transform 420ms ease;
        }
        .ai-initiative-solution-card:hover .ai-initiative-solution-media img {
          transform: scale(1.06);
        }
        .ai-initiative-solution-media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.52));
          animation: aiInitiativeSolutionOverlayPulse 7s ease-in-out infinite;
          animation-delay: var(--solution-delay, 0ms);
          pointer-events: none;
        }
        .ai-initiative-solution-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .ai-initiative-marquee-wrap:hover .ai-initiative-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-initiative-marquee-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>

      <section className="pt-24 pb-14 md:pt-28 md:pb-20 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-1.5 text-black">
            <span className="h-3 w-3 rounded-full bg-black" />
            <span className="h-3 w-3 rounded-full border border-black/90 bg-transparent" />
            <span className="w-16 border-t border-dashed border-black/40" />
          </div>

          <div className="ai-initiative-shell relative overflow-hidden rounded-[22px] bg-[#ddd6c3] p-7 sm:p-8 md:p-10">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
              <div className="absolute left-12 -bottom-10 h-32 w-32 rounded-full bg-[#046241]/20 blur-2xl" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="ai-initiative-enter">
                <h1 className="text-4xl sm:text-5xl font-bold leading-[1.04] text-[#111] mb-4 uppercase">
                  {config.pageLabel}
                </h1>
                <p className="text-[15px] leading-7 text-[#202020] max-w-xl mb-6">
                  {config.intro}
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

              <div className="ai-initiative-enter relative h-[260px] sm:h-[320px] md:h-[360px]" style={{ animationDelay: '0.08s' }}>
                <div className="ai-initiative-hero-card ai-initiative-hero-card-a absolute left-[4%] top-[8%] h-[52%] w-[44%] rounded-2xl overflow-hidden border border-white/40 shadow-xl">
                  <img
                    src={config.heroImages[0] || heroFallbackImages[0]}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== heroFallbackImages[0]) {
                        e.currentTarget.src = heroFallbackImages[0];
                      }
                    }}
                  />
                </div>
                <div className="ai-initiative-hero-card ai-initiative-hero-card-b absolute right-[6%] top-[2%] h-[46%] w-[42%] rounded-2xl overflow-hidden border border-white/40 shadow-xl">
                  <img
                    src={config.heroImages[1] || heroFallbackImages[1]}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== heroFallbackImages[1]) {
                        e.currentTarget.src = heroFallbackImages[1];
                      }
                    }}
                  />
                </div>
                <div className="ai-initiative-hero-card ai-initiative-hero-card-c absolute right-[18%] bottom-[2%] h-[50%] w-[50%] rounded-2xl overflow-hidden border border-white/40 shadow-xl">
                  <img
                    src={config.heroImages[2] || heroFallbackImages[2]}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== heroFallbackImages[2]) {
                        e.currentTarget.src = heroFallbackImages[2];
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {config.modalities && (
        <section className="pt-2 pb-10 md:pb-14 bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="ai-initiative-marquee-wrap">
              <div className="ai-initiative-marquee-track">
                {[0, 1].map((loop) => (
                  <div
                    key={`modalities-loop-${loop}`}
                    className="ai-initiative-marquee-group"
                    aria-hidden={loop === 1 ? 'true' : undefined}
                  >
                    {config.modalities.map((item, idx) => (
                      <article
                        key={`${loop}-${item.title}`}
                        className="ai-initiative-enter ai-initiative-glass-card ai-initiative-marquee-card rounded-2xl bg-white border border-[#e2e2e2] p-5 shadow-[0_10px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-transform"
                        style={loop === 0 ? { animationDelay: `${idx * 0.06}s` } : undefined}
                      >
                        <h3 className="text-xl font-extrabold text-dark-serpent mb-2">{item.title}</h3>
                        <p className="text-[14px] leading-6 text-[#4a4a4a]">{item.description}</p>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="pb-14 md:pb-20 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b6b6b]">
              {config.highlightSubtitle}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3a3a3a] uppercase mt-2">
              {config.highlightTitle}
            </h2>
          </div>

          {config.cards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5 items-stretch">
              {config.cards.map((item, idx) => {
                const positionClass =
                  config.cards.length === 5
                    ? idx === 3
                      ? 'lg:col-span-2 lg:col-start-2'
                      : idx === 4
                        ? 'lg:col-span-2 lg:col-start-4'
                        : 'lg:col-span-2'
                    : 'lg:col-span-2';
                const fallbackImage = solutionCardFallbackImages[idx % solutionCardFallbackImages.length];

                return (
                  <article
                    key={item.title}
                    className={`ai-initiative-enter ai-initiative-glass-card ai-initiative-solution-card ${positionClass} rounded-2xl bg-[#efefef] border border-[#dfdfdf] p-6 hover:shadow-lg transition-shadow`}
                    style={{ animationDelay: `${idx * 0.07}s`, '--solution-delay': `${idx * 0.28}s` }}
                  >
                    <div className="ai-initiative-solution-media">
                      <img
                        src={item.image || fallbackImage}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src !== fallbackImage) {
                            e.currentTarget.src = fallbackImage;
                          }
                        }}
                      />
                    </div>
                    <div className="ai-initiative-solution-body">
                      <h3 className="text-2xl font-bold text-[#2f2f2f] mb-3">{item.title}</h3>
                      <p className="text-[14px] leading-6 text-[#555]">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {config.projects && (
            <CircularGallery
              items={projectItems}
              bend={3}
              borderRadius={0.05}
              textColor="#ffffff"
              scrollSpeed={2}
              scrollEase={0.05}
            />
          )}
        </div>
      </section>
    </div>
  );
};

const ServiceDetail = () => {
  const { id } = useParams();
  const aiInitiativeConfig = AI_INITIATIVE_CONFIGS[id];
  if (aiInitiativeConfig) return <AIInitiativeDetail config={aiInitiativeConfig} />;

  const typeConfig = TYPE_SERVICE_CONFIGS[id];
  if (typeConfig) return <TypeServiceDetail config={typeConfig} />;

  const service = SERVICES_DATA.find((s) => s.id === id);

  if (!service) return <Navigate to="/" />;

  return (
    <div className="animate-in fade-in duration-700 home-modern-bg">
      <section className="bg-transparent py-32 relative overflow-hidden">
        {/* Subtle technical grid for service detail */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridSmall" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0 L0 0 0 40" fill="none" stroke="#e6e6e6" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridSmall)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-castleton font-bold mb-8 inline-flex items-center hover:translate-x-2 transition-transform group">
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center section-fade-in">
            <div>
              <span className="inline-block bg-castleton/10 text-castleton px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-castleton/30">
                Professional Solution
              </span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-dark-serpent mb-8 leading-tight">
                {service.title}
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed mb-10 font-light">
                {service.fullDesc}
              </p>
              <div className="flex flex-wrap gap-3">
                {service.benefits.map((benefit, idx) => (
                  <span key={benefit} className="glass-card px-4 py-3 rounded-full text-sm font-bold text-castleton border-castleton/20 shadow-lg section-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative section-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card p-1 rounded-3xl hover-lift">
                <img 
                  src={`https://picsum.photos/seed/${service.id}/800/600`} 
                  alt={service.title} 
                  className="rounded-3xl shadow-2xl w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 glass-card hover-lift p-8 rounded-3xl hidden md:block backdrop-blur-lg border-white/20 shadow-2xl">
                <p className="text-dark-serpent font-black text-2xl leading-tight">Proven <br />Success</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 section-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-dark-serpent mb-6">Our Methodical <span className="text-gradient">Process</span></h2>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">Engineered precision at every step to ensure exceptional outcomes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {service.process.map((step, index) => (
              <div key={step} className="relative group section-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="glass-card hover-lift h-full p-8 text-center rounded-2xl border-castleton/20 transition-all">
                  <div className="mb-6 inline-block">
                    <div className="w-14 h-14 bg-gradient-to-br from-castleton to-saffron rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-castleton/30 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                  </div>
                  <h4 className="font-bold text-dark-serpent mb-2 text-sm uppercase tracking-widest">{step}</h4>
                </div>
                {index < service.process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-castleton to-transparent z-10 group-hover:w-8 transition-all"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-dark-serpent via-castleton to-dark-serpent py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-1/2 right-0 w-96 h-96 bg-saffron rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10 section-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight text-white">Need a custom <span className="text-saffron">{service.title}</span> solution?</h2>
          <p className="text-gray-100 mb-12 text-lg font-light leading-relaxed">Our experts are ready to design a workflow tailored to your specific technical requirements and business goals.</p>
          <Link to="/contact" className="btn-modern bg-saffron text-dark-serpent px-12 py-6 rounded-full font-bold text-lg hover:bg-white transition-all inline-block shadow-lg shadow-saffron/40 hover:shadow-xl hover:shadow-saffron/50">
            Request a Free Consultation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
