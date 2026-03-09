import React, { useState } from 'react';

const JoinUsNow = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    position: '',
    country: '',
    address: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0] || null;
    setUploadedFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <section className="px-4 sm:px-6 lg:px-8 py-24 md:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Join Our Team
            </h1>
            <p className="mt-3 text-slate-300 text-base sm:text-lg">
              Please fill out the form below to apply.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Michael"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Chen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2" htmlFor="age">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g. 24"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 sm:p-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2" htmlFor="position">
                      Position Applied
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      <option value="">Select position</option>
                      <option value="annotator">Data Annotator</option>
                      <option value="qa">QA Specialist</option>
                      <option value="operations">Operations Associate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2" htmlFor="country">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      <option value="">Select country</option>
                      <option value="philippines">Philippines</option>
                      <option value="indonesia">Indonesia</option>
                      <option value="malaysia">Malaysia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2" htmlFor="address">
                    Current Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Quezon City"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-slate-300 text-center mb-4">Upload CV (PDF)</p>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="relative mx-auto h-[200px] w-[200px] rounded-full border-2 border-dashed border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-slate-950/60 flex items-center justify-center">
                      <div className="text-center px-6">
                        <svg
                          className="mx-auto h-8 w-8 text-emerald-400 animate-pulse"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 17V3" />
                          <path d="m6 9 6-6 6 6" />
                          <path d="M20 21H4" />
                        </svg>
                        <p className="mt-3 text-slate-200 text-sm leading-snug">
                          Click to upload or drag and drop
                        </p>
                        <p className="mt-1 text-slate-500 text-xs">
                          {uploadedFile ? uploadedFile.name : 'PDF only (max 10MB)'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 px-6 py-3.5 text-slate-950 font-extrabold hover:scale-105 transition-transform"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default JoinUsNow;
