import React from 'react';
import privacyPolicyText from '../content/privacy-policy.txt?raw';

const PrivacyPolicy = () => {
  return (
    <div className="animate-in fade-in duration-700 bg-white">
      <section className="py-24 md:py-28 bg-gradient-to-b from-paper/40 via-white to-sea-salt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-black text-dark-serpent mb-8">Privacy Policy</h1>
          <div className="whitespace-pre-line text-gray-700 leading-relaxed text-[15px]">{privacyPolicyText}</div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
