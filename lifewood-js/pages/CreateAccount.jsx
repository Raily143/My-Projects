import React from 'react';

const CreateAccount = () => {
  const applicationBackground =
    'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=2200&q=80';
  const pageStyle = {
    background: `url("${applicationBackground}") center center / cover no-repeat`,
    minHeight: '100vh',
  };

  return (
    <div className="relative animate-in fade-in duration-700 overflow-hidden brand-modern-bg" style={pageStyle}>
      <div className="absolute inset-0 bg-[#02060d]/74" />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 16%, rgba(255,255,255,0.16) 0, rgba(255,255,255,0) 34%), radial-gradient(circle at 78% 64%, rgba(255,255,255,0.14) 0, rgba(255,255,255,0) 38%)',
        }}
      />
      <section className="relative z-10 pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
              Join Our Team
            </h1>
            <p className="text-white/90 text-base sm:text-lg">
              Please fill out the form below to apply.
            </p>
          </div>

          <div className="rounded-[22px] border border-white/30 bg-white/12 backdrop-blur-[10px] p-6 sm:p-8 md:p-10">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" placeholder="e.g. Michael" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saffron/45" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="lastName">Last Name</label>
                <input id="lastName" type="text" placeholder="e.g. Chen" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saffron/45" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2" htmlFor="gender">Gender</label>
                  <select id="gender" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-saffron/45">
                    <option value="" className="text-dark-serpent">Select gender</option>
                    <option value="female" className="text-dark-serpent">Female</option>
                    <option value="male" className="text-dark-serpent">Male</option>
                    <option value="other" className="text-dark-serpent">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2" htmlFor="age">Age</label>
                  <input id="age" type="number" placeholder="e.g. 24" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saffron/45" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="phone">Phone Number</label>
                <div className="grid grid-cols-[minmax(0,170px)_1fr] gap-3">
                  <select className="rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-saffron/45">
                    <option value="+63" className="text-dark-serpent">+63 (Philippines)</option>
                    <option value="+1" className="text-dark-serpent">+1 (United States)</option>
                    <option value="+44" className="text-dark-serpent">+44 (United Kingdom)</option>
                  </select>
                  <input id="phone" type="tel" placeholder="912345678" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saffron/45" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="email">Email Address</label>
                <input id="email" type="email" placeholder="michael@example.com" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saffron/45" />
              </div>

              <p className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                Note: Please check your email and continue with the AI pre-screening.
              </p>

              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="position">Position Applied</label>
                <select id="position" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-saffron/45">
                  <option value="" className="text-dark-serpent">Select position to add</option>
                  <option value="annotator" className="text-dark-serpent">Data Annotator</option>
                  <option value="qa" className="text-dark-serpent">QA Specialist</option>
                  <option value="project-coordinator" className="text-dark-serpent">Project Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="country">Country</label>
                <select id="country" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-saffron/45">
                  <option value="" className="text-dark-serpent">Select country</option>
                  <option value="philippines" className="text-dark-serpent">Philippines</option>
                  <option value="malaysia" className="text-dark-serpent">Malaysia</option>
                  <option value="indonesia" className="text-dark-serpent">Indonesia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2" htmlFor="address">Current Address</label>
                <input id="address" type="text" placeholder="e.g. Quezon City, Metro Manila" className="w-full rounded-xl border border-white/30 bg-white/18 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saffron/45" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Upload CV (PDF)</label>
                <label className="block w-full rounded-xl border-2 border-dashed border-white/45 bg-white/8 p-6 sm:p-8 text-center cursor-pointer">
                  <input type="file" accept=".pdf" className="hidden" />
                  <p className="text-white font-semibold">Click to upload or drag and drop</p>
                  <p className="text-white/65 text-sm mt-1">PDF only (max. 10MB)</p>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-white/30 border border-white/25 px-6 py-3.5 text-white font-bold hover:bg-white/40 transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateAccount;
