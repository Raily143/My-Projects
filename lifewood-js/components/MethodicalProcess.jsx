import React, { useEffect, useRef, useState } from 'react';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Data Intake',
    description: 'We securely collect and structure raw datasets from multiple global sources while ensuring integrity, confidentiality, and compliance.'
  },
  {
    number: '02',
    title: 'Intelligent Structuring',
    description: 'Our teams categorize and organize data using standardized taxonomies and AI-assisted workflows to prepare it for scalable processing.'
  },
  {
    number: '03',
    title: 'Multi-Layer Validation',
    description: 'Human reviewers and automated systems validate accuracy, consistency, and completeness to maintain enterprise-grade quality.'
  },
  {
    number: '04',
    title: 'Standardization & Optimization',
    description: 'Data is normalized into unified formats, enriched with metadata, and optimized for model readiness and performance.'
  },
  {
    number: '05',
    title: 'Secure Archival & Delivery',
    description: 'Finalized datasets are encrypted, securely stored, and delivered through controlled access environments to meet global security standards.'
  }
];

const MethodicalProcess = () => {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          PROCESS_STEPS.forEach((_, index) => {
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, index]);
            }, index * 200);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-b from-white via-paper to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-24 section-fade-in">
          <h2 className="text-5xl md:text-6xl font-extrabold text-dark-serpent mb-6">
            Our <span className="text-gradient">Methodical Process</span>
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Engineered precision at every stage to deliver exceptional results at scale.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-castleton to-saffron mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Process Steps Container */}
        <div className="relative">
          {/* Horizontal Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-castleton/30 via-castleton/60 to-castleton/30 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {PROCESS_STEPS.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col items-center section-fade-in transition-all duration-700 ease-out transform ${
                  visibleSteps.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                {/* Step Card */}
                <div className="group glass-card hover-lift h-full w-full p-10 rounded-2xl border-castleton/20 transition-all duration-500 relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-castleton/5 to-saffron/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                  
                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="text-6xl font-black bg-gradient-to-r from-castleton to-saffron bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 mb-8">
                      {step.number}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-dark-serpent mb-5 leading-tight group-hover:text-castleton transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed font-light">
                      {step.description}
                    </p>

                    {/* Hover Accent Bar */}
                    <div className="mt-6 h-1 w-0 bg-gradient-to-r from-castleton to-saffron group-hover:w-full transition-all duration-500 rounded-full"></div>
                  </div>
                </div>

                {/* Mobile/Tablet Vertical Connectors */}
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="lg:hidden h-12 w-px bg-gradient-to-b from-castleton/50 to-castleton/20 my-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodicalProcess;
