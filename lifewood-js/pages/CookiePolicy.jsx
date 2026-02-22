import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="animate-in fade-in duration-700 bg-white">
      <section className="py-24 md:py-28 bg-gradient-to-b from-paper/40 via-white to-sea-salt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-black text-dark-serpent mb-6">Cookie Policy</h1>
          <p className="text-gray-700 leading-relaxed mb-10">
            At Lifewood Data Technology Ltd., we use cookies and similar tracking technologies to enhance your
            experience, analyze site usage, and personalize content. This Cookie Policy explains what cookies are,
            how we use them, and how you can manage your preferences.
          </p>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">1. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files stored on your device when you visit a website. They help websites
                remember actions and preferences to improve functionality and user experience.
              </p>
              <p className="mb-3">There are several types of cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when your browser closes.</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain until they expire or are deleted.</li>
                <li><strong>First-party Cookies:</strong> Cookies set by the site you are visiting.</li>
                <li><strong>Third-party Cookies:</strong> Cookies set by other services such as analytics/ad providers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">2. How Lifewood Uses Cookies</h2>
              <p className="mb-4">
                We use cookies to improve browsing experience, website performance, and personalization.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for core website functionality.</li>
                <li><strong>Performance and Analytics Cookies:</strong> Help us measure and improve site usage.</li>
                <li><strong>Functionality Cookies:</strong> Remember your settings and preferences.</li>
                <li><strong>Targeting and Advertising Cookies:</strong> Help deliver relevant advertising and reporting.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">3. Third-Party Cookies</h2>
              <p>
                Third-party providers (such as analytics and social media services) may place cookies on your device
                to support measurement, functionality, and ad relevance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">4. Your Cookie Choices</h2>
              <p className="mb-4">
                You can accept or reject non-essential cookies and manage preferences in your browser settings.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google Chrome: Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
                <li>Mozilla Firefox: Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                <li>Microsoft Edge: Settings &gt; Site Permissions &gt; Cookies and site data</li>
                <li>Safari: Preferences &gt; Privacy &gt; Cookies and website data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">5. Managing Cookies on Lifewood</h2>
              <p>
                You can update cookie preferences anytime from the website footer via Cookie Settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">6. Changes to This Cookie Policy</h2>
              <p>
                We may update this policy periodically to reflect legal, technical, or service changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-dark-serpent mb-4">7. Contact Us</h2>
              <p>If you have questions about this Cookie Policy, contact us at:</p>
              <p className="mt-3 font-semibold text-castleton">lifewood@gmail.com</p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;
