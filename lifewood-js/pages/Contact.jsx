import React, { useState } from 'react';

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg">
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
      <section className="section-fade-in pt-24 md:pt-28 pb-4 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="lg:self-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark-serpent mb-6 leading-tight">Get in touch with Lifewood</h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-xl">
                We provide global Data Engineering Services that enable enterprise AI solutions. Share your project goals and our team will connect with you.
              </p>

            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden lg:mt-6">
              <div className="h-48 md:h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
                  alt="Lifewood contact"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8">
                {isSubmitted ? (
                  <div className="py-10 text-center">
                    <h2 className="text-2xl font-black text-dark-serpent mb-3">Thank you for contacting us</h2>
                    <p className="text-gray-600 mb-6">Your message has been received. Our team will get back to you soon.</p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="inline-flex items-center justify-center bg-dark-serpent text-white px-6 py-3 rounded-full font-bold hover:bg-castleton transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-castleton focus:ring-1 focus:ring-castleton outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-castleton focus:ring-1 focus:ring-castleton outline-none transition-colors"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-castleton focus:ring-1 focus:ring-castleton outline-none transition-colors resize-none"
                        placeholder="Tell us about your request"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center bg-saffron text-dark-serpent px-6 py-3.5 rounded-full font-bold hover:bg-earth-yellow transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;






