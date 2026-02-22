import React from 'react';

const ESG = () => {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="section-fade-in bg-gradient-to-br from-dark-serpent via-castleton to-dark-serpent py-32 text-center relative overflow-hidden">
        {/* Soft abstract shapes for ESG page */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="esgA" x1="0" x2="1">
                <stop offset="0%" stopColor="#FFB347" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f5eedb" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <circle cx="85%" cy="15%" r="160" fill="url(#esgA)" />
            <ellipse cx="10%" cy="80%" rx="180" ry="80" fill="#FFB347" opacity="0.08" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-saffron font-bold tracking-widest uppercase mb-4 block">Sustainability & Impact</span>
          <h1 className="text-white text-2xl sm:text-4xl md:text-6xl font-black mb-8">AI for a <span className="text-saffron">Better World</span></h1>
          <p className="text-xl text-gray-100 leading-relaxed">
            At Lifewood, ESG (Environmental, Social, and Governance) isn't just a department—it's woven into our technology and our hiring. We believe data solutions should contribute to a more equitable and sustainable future.
          </p>
        </div>
      </section>

      <section className="section-fade-in py-24 bg-gradient-to-b from-dark-serpent to-dark-serpent/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { 
                title: 'Inclusive Employment', 
                desc: 'We prioritize hiring from underserved regions and rural communities, providing specialized digital training and competitive wages to bridge the economic gap.', 
                icon: '🌍',
                metric: '65% Staff from Emerging Markets'
              },
              { 
                title: 'Carbon Neutral AI', 
                desc: 'Our delivery centers are powered by renewable energy. We optimize our training models to reduce computational waste and minimize our environmental footprint.', 
                icon: '🌱',
                metric: '100% Carbon Neutral Operations'
              },
              { 
                title: 'Ethical Data Sourcing', 
                desc: 'We enforce strict transparency and consent protocols for all data collection. Our bias-detection algorithms ensure fair and representative training datasets.', 
                icon: '⚖️',
                metric: '99.9% Privacy Compliance'
              }
            ].map((pillar, idx) => (
              <div key={pillar.title} className="glass-card hover-lift p-10 rounded-[3rem] border border-saffron/20 hover:border-saffron/50 transition-all duration-300" style={{animationDelay: `${idx * 100}ms`}}>
                <div className="text-5xl mb-6">{pillar.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-paper">{pillar.title}</h3>
                <p className="text-paper/80 mb-8 leading-relaxed">{pillar.desc}</p>
                <div className="border-t border-saffron/20 pt-6">
                  <span className="text-saffron font-bold uppercase text-sm tracking-wide">{pillar.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-fade-in py-24 bg-gradient-to-r from-castleton via-dark-serpent to-castleton text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"><svg className="w-full h-full" preserveAspectRatio="none"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="#FFB347"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/></svg></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-bold mb-12 italic text-saffron">"We don't just process data; we empower people through technology."</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Female Leaders', val: '45%' },
              { label: 'Rural Reach', val: '15 Regions' },
              { label: 'Renewable Usage', val: '100%' },
              { label: 'Community Aid', val: '$2M+' },
            ].map((s, idx) => (
              <div key={s.label} className="glass-card-dark p-6 rounded-2xl" style={{animationDelay: `${idx * 80}ms`}}>
                <div className="text-4xl font-black text-saffron mb-2">{s.val}</div>
                <div className="text-sm font-bold uppercase text-paper/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ESG;
