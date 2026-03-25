import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addJoinApplication } from '../utils/adminApplicantStore';
import { insertJoinUsApplication, uploadApplicantCvToSupabase } from '../services/supabaseApplications';
import { isSupabaseConfigured } from '../utils/supabaseClient';

const COMMON_COUNTRIES = [
  'Philippines',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'India',
  'Japan',
  'South Korea',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Brazil',
  'Mexico',
  'Indonesia',
  'Malaysia',
  'Thailand',
  'United Arab Emirates',
  'South Africa',
];

const POSITIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Data Annotator',
  'QA Specialist',
  'Project Coordinator',
  'AI Operations Associate',
];

const MAX_CV_BYTES = 10 * 1024 * 1024;
const MIN_APPLICANT_AGE = 18;
const MAX_APPLICANT_AGE = 80;
const PHONE_OPTIONS = [
  { iso2: 'PH', country: 'Philippines', code: '+63', label: 'Philippines +63' },
  { iso2: 'US', country: 'United States', code: '+1', label: 'United States +1' },
  { iso2: 'GB', country: 'United Kingdom', code: '+44', label: 'United Kingdom +44' },
  { iso2: 'CA', country: 'Canada', code: '+1', label: 'Canada +1' },
  { iso2: 'AU', country: 'Australia', code: '+61', label: 'Australia +61' },
  { iso2: 'SG', country: 'Singapore', code: '+65', label: 'Singapore +65' },
  { iso2: 'IN', country: 'India', code: '+91', label: 'India +91' },
  { iso2: 'JP', country: 'Japan', code: '+81', label: 'Japan +81' },
  { iso2: 'KR', country: 'South Korea', code: '+82', label: 'South Korea +82' },
  { iso2: 'DE', country: 'Germany', code: '+49', label: 'Germany +49' },
  { iso2: 'FR', country: 'France', code: '+33', label: 'France +33' },
  { iso2: 'ES', country: 'Spain', code: '+34', label: 'Spain +34' },
  { iso2: 'IT', country: 'Italy', code: '+39', label: 'Italy +39' },
  { iso2: 'BR', country: 'Brazil', code: '+55', label: 'Brazil +55' },
  { iso2: 'MX', country: 'Mexico', code: '+52', label: 'Mexico +52' },
  { iso2: 'ID', country: 'Indonesia', code: '+62', label: 'Indonesia +62' },
  { iso2: 'MY', country: 'Malaysia', code: '+60', label: 'Malaysia +60' },
  { iso2: 'TH', country: 'Thailand', code: '+66', label: 'Thailand +66' },
  { iso2: 'AE', country: 'United Arab Emirates', code: '+971', label: 'United Arab Emirates +971' },
  { iso2: 'ZA', country: 'South Africa', code: '+27', label: 'South Africa +27' },
];

const getRegionFromLocale = (locale) => {
  if (!locale || typeof locale !== 'string') return '';
  const parts = locale.replace('_', '-').split('-');
  const region = parts.find((part) => /^[A-Z]{2}$/i.test(part));
  return region ? region.toUpperCase() : '';
};

const GMAIL_PATTERN = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@gmail\.com$/i;
const PHONE_RULES_BY_COUNTRY = {
  PH: { min: 10, max: 10, stripLeadingZero: true },
  US: { min: 10, max: 10, stripLeadingZero: false },
  GB: { min: 10, max: 10, stripLeadingZero: true },
  CA: { min: 10, max: 10, stripLeadingZero: false },
  AU: { min: 9, max: 9, stripLeadingZero: true },
  SG: { min: 8, max: 8, stripLeadingZero: false },
  IN: { min: 10, max: 10, stripLeadingZero: true },
  JP: { min: 9, max: 10, stripLeadingZero: true },
  KR: { min: 9, max: 10, stripLeadingZero: true },
  DE: { min: 10, max: 11, stripLeadingZero: true },
  FR: { min: 9, max: 9, stripLeadingZero: true },
  ES: { min: 9, max: 9, stripLeadingZero: false },
  IT: { min: 9, max: 10, stripLeadingZero: false },
  BR: { min: 10, max: 11, stripLeadingZero: false },
  MX: { min: 10, max: 10, stripLeadingZero: false },
  ID: { min: 9, max: 12, stripLeadingZero: true },
  MY: { min: 9, max: 10, stripLeadingZero: true },
  TH: { min: 8, max: 9, stripLeadingZero: true },
  AE: { min: 8, max: 9, stripLeadingZero: true },
  ZA: { min: 9, max: 9, stripLeadingZero: true },
};

const isValidGmailAddress = (value) => {
  const email = String(value || '').trim().toLowerCase();
  if (!GMAIL_PATTERN.test(email)) return false;

  const [localPart] = email.split('@');
  if (!localPart) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;

  return true;
};

const normalizePhoneDigitsForCountry = ({ rawDigits, countryIso2, countryCode }) => {
  let digits = String(rawDigits || '').replace(/[^\d]/g, '');
  const codeDigits = String(countryCode || '').replace(/[^\d]/g, '');
  const rule = PHONE_RULES_BY_COUNTRY[countryIso2];

  if (codeDigits && digits.startsWith(codeDigits) && digits.length > codeDigits.length) {
    digits = digits.slice(codeDigits.length);
  }

  if (rule?.stripLeadingZero && digits.startsWith('0') && digits.length > 1) {
    digits = digits.slice(1);
  }

  return digits;
};

const validatePhoneNumberForCountry = ({ rawDigits, countryIso2, countryCode, countryLabel }) => {
  const normalizedDigits = normalizePhoneDigitsForCountry({
    rawDigits,
    countryIso2,
    countryCode,
  });

  if (!normalizedDigits) {
    return {
      ok: false,
      normalizedDigits: '',
      error: 'Please provide a valid phone number.',
    };
  }

  const rule = PHONE_RULES_BY_COUNTRY[countryIso2];
  if (!rule) {
    if (!/^\d{6,15}$/.test(normalizedDigits)) {
      return {
        ok: false,
        normalizedDigits,
        error: 'Phone number is not in a valid international format.',
      };
    }
    return { ok: true, normalizedDigits, error: '' };
  }

  const length = normalizedDigits.length;
  if (length < rule.min || length > rule.max) {
    const expectedLengthText =
      rule.min === rule.max ? `${rule.min} digits` : `${rule.min} to ${rule.max} digits`;
    return {
      ok: false,
      normalizedDigits,
      error: `Please enter a valid ${countryLabel || 'selected country'} phone number (${expectedLengthText}).`,
    };
  }

  return { ok: true, normalizedDigits, error: '' };
};

const JoinUsNow = () => {
  const phonePickerRef = useRef(null);
  const uploadTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneCountry: 'PH',
    phoneLocal: '',
    email: '',
    gender: '',
    age: '',
    position: '',
    country: '',
    address: '',
  });
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneOptions = PHONE_OPTIONS;

  const selectedPhoneOption =
    phoneOptions.find((option) => option.iso2 === formData.phoneCountry) || phoneOptions[0];

  const filteredPhoneOptions = useMemo(() => {
    const query = phoneSearch.trim().toLowerCase();
    if (!query) return phoneOptions;
    const numericQuery = query.replace('+', '');
    return phoneOptions.filter((option) => {
      return (
        option.country.toLowerCase().includes(query) ||
        option.iso2.toLowerCase().includes(query) ||
        option.code.includes(query) ||
        option.code.replace('+', '').includes(numericQuery)
      );
    });
  }, [phoneOptions, phoneSearch]);

  useEffect(() => {
    const languageCandidates = Array.isArray(navigator.languages)
      ? navigator.languages
      : [navigator.language];
    const detected = languageCandidates
      .map((locale) => getRegionFromLocale(locale))
      .find((iso2) => phoneOptions.some((option) => option.iso2 === iso2));

    if (detected) {
      setFormData((prev) => ({ ...prev, phoneCountry: detected }));
    }
  }, [phoneOptions]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!phonePickerRef.current || phonePickerRef.current.contains(event.target)) return;
      setPhoneOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        window.clearInterval(uploadTimerRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startUploadProgress = () => {
    if (uploadTimerRef.current) {
      window.clearInterval(uploadTimerRef.current);
    }

    setUploadProgress(0);
    uploadTimerRef.current = window.setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(uploadTimerRef.current);
          uploadTimerRef.current = null;
          return 100;
        }
        return prev + 20;
      });
    }, 80);
  };

  const validatePdf = (file) => {
    if (!file) return 'Please upload your CV.';
    const fileName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
    if (!isPdf) return 'Only PDF files are allowed.';
    if (file.size > MAX_CV_BYTES) return 'PDF must be 10MB or smaller.';
    return '';
  };

  const handleFileUpload = (file) => {
    const error = validatePdf(file);
    if (error) {
      setUploadedFile(null);
      setUploadProgress(0);
      setUploadStatus(error);
      return;
    }

    setUploadedFile(file);
    setUploadStatus(`Uploaded: ${file.name}`);
    startUploadProgress();
  };

  const handleInputFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleFileUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    handleFileUpload(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitStatus('');

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setSubmitStatus('Please complete Personal Details before submitting.');
      return;
    }

    if (!formData.gender || !formData.age) {
      setSubmitStatus('Please complete Biometric Details before submitting.');
      return;
    }

    const ageValue = Number(String(formData.age || '').trim());
    if (!Number.isInteger(ageValue) || ageValue < MIN_APPLICANT_AGE || ageValue > MAX_APPLICANT_AGE) {
      setSubmitStatus(`Applicants must be between ${MIN_APPLICANT_AGE} and ${MAX_APPLICANT_AGE} years old.`);
      return;
    }

    if (!formData.position || !formData.country || !formData.address) {
      setSubmitStatus('Please complete Application Details before submitting.');
      return;
    }

    const normalizedEmail = String(formData.email || '').trim().toLowerCase();
    if (!isValidGmailAddress(normalizedEmail)) {
      setSubmitStatus('Please provide a valid Gmail address (example@gmail.com).');
      return;
    }

    const rawDigits = formData.phoneLocal.replace(/[^\d]/g, '');
    if (!selectedPhoneOption || !rawDigits) {
      setSubmitStatus('Please provide a valid phone number.');
      return;
    }

    const phoneValidation = validatePhoneNumberForCountry({
      rawDigits,
      countryIso2: selectedPhoneOption.iso2,
      countryCode: selectedPhoneOption.code,
      countryLabel: selectedPhoneOption.country,
    });

    if (!phoneValidation.ok) {
      setSubmitStatus(phoneValidation.error);
      return;
    }

    if (!uploadedFile) {
      setSubmitStatus('Please upload your CV in PDF format before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let cvStoragePath = '';
      let cvPublicUrl = '';

      if (isSupabaseConfigured) {
        const { path, publicUrl, error: cvUploadError } = await uploadApplicantCvToSupabase({
          file: uploadedFile,
          applicantEmail: normalizedEmail,
        });

        if (cvUploadError || !path) {
          setSubmitStatus(`CV upload failed: ${cvUploadError?.message || 'Please check Supabase Storage bucket policies.'}`);
          return;
        }

        cvStoragePath = path;
        cvPublicUrl = publicUrl || '';
      }

      const storedCvValue = cvStoragePath || uploadedFile?.name || '';

      const localPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: normalizedEmail,
        phoneCountryCode: selectedPhoneOption?.code || '',
        phoneLocal: phoneValidation.normalizedDigits,
        gender: formData.gender,
        age: String(ageValue),
        position: formData.position,
        country: formData.country,
        address: formData.address,
        cvFileName: storedCvValue,
        cvStoragePath,
        cvFileUrl: cvPublicUrl,
      };

      addJoinApplication(localPayload);

      const normalizedGender =
        localPayload.gender === 'prefer-not-to-say' ? 'prefer_not' : localPayload.gender;

      const { error: supabaseError } = await insertJoinUsApplication({
        first_name: localPayload.firstName,
        last_name: localPayload.lastName,
        email: localPayload.email,
        phone_country_code: localPayload.phoneCountryCode,
        phone_local: localPayload.phoneLocal,
        gender: normalizedGender,
        age: Number(localPayload.age),
        position_applied: localPayload.position,
        country: localPayload.country,
        address: localPayload.address,
        cv_file_name: storedCvValue,
        application_status: 'pending',
      });

      if (uploadTimerRef.current) {
        window.clearInterval(uploadTimerRef.current);
        uploadTimerRef.current = null;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setFormData({
        firstName: '',
        lastName: '',
        phoneCountry: selectedPhoneOption?.iso2 || 'PH',
        phoneLocal: '',
        email: '',
        gender: '',
        age: '',
        position: '',
        country: '',
        address: '',
      });
      setPhoneSearch('');
      setPhoneOpen(false);
      setUploadedFile(null);
      setUploadProgress(0);
      setUploadStatus('');
      setDragActive(false);

      if (supabaseError) {
        if (supabaseError.code === '23505') {
          setSubmitStatus('Application submitted locally. This email already exists in Supabase.');
          return;
        }
        setSubmitStatus(`Application submitted locally. Supabase sync failed: ${supabaseError.message || 'Unknown error'}`);
        return;
      }

      setSubmitStatus('Application submitted successfully.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061425] text-white">
      <style>{`
        .join-bg-grid {
          background-image:
            radial-gradient(circle at 2px 2px, rgba(181, 255, 227, 0.16) 1px, transparent 0),
            linear-gradient(145deg, rgba(8, 25, 43, 0.9), rgba(4, 19, 33, 0.92));
          background-size: 24px 24px, 100% 100%;
        }
        .join-glass {
          border: 1px solid rgba(120, 164, 196, 0.35);
          background: linear-gradient(145deg, rgba(12, 32, 58, 0.84), rgba(10, 27, 49, 0.78));
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px) saturate(130%);
          -webkit-backdrop-filter: blur(12px) saturate(130%);
        }
        .join-input {
          border: 1px solid rgba(120, 164, 196, 0.4);
          background: rgba(7, 19, 37, 0.9);
          transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
        }
        .join-input:focus {
          border-color: rgba(255, 179, 71, 0.88);
          box-shadow: 0 0 0 3px rgba(255, 179, 71, 0.16);
          transform: translateY(-1px);
          outline: none;
        }
      `}</style>

      <div className="absolute inset-0 join-bg-grid" />
      <div className="absolute -top-16 -left-12 h-64 w-64 rounded-full bg-[#046241]/24 blur-3xl" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#FFB347]/18 blur-3xl" />

      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mx-auto max-w-7xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)] gap-6">
            <div className="space-y-4">
              <article className="join-glass rounded-[1.25rem] p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-0.5">
                <p className="text-3xl sm:text-4xl font-black leading-tight">
                  Welcome to <span className="text-[#FFB347]">Lifewood</span>
                </p>
                <p className="mt-2 text-slate-200 text-base sm:text-lg">
                  Join the world&apos;s leading provider of AI-powered data solutions.
                </p>
              </article>

              <article className="join-glass rounded-[1.25rem] p-5 sm:p-6">
                <h1 className="text-4xl sm:text-5xl font-black leading-tight text-[#FFB347]">Join Our Team</h1>
                <p className="mt-2 text-slate-200 text-base sm:text-lg">Please fill out the form below to apply.</p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-600/50 bg-[#0b1d35]/70 p-4">
                    <h2 className="text-slate-100 text-xl font-bold mb-3">Personal Details</h2>
                    <div className="space-y-3">
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        type="text"
                        placeholder="First Name"
                        className="join-input w-full rounded-lg px-4 py-3 text-white placeholder:text-slate-400"
                      />
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        type="text"
                        placeholder="Last Name"
                        className="join-input w-full rounded-lg px-4 py-3 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-600/50 bg-[#0b1d35]/70 p-4">
                    <h2 className="text-slate-100 text-xl font-bold mb-3">Biometric Details</h2>
                    <div className="space-y-3">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="join-input w-full rounded-lg px-4 py-3 text-white"
                      >
                        <option value="">Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      <input
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        type="number"
                        min={MIN_APPLICANT_AGE}
                        max={MAX_APPLICANT_AGE}
                        placeholder="e.g. 24"
                        className="join-input w-full rounded-lg px-4 py-3 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-600/50 bg-[#0b1d35]/70 p-4">
                  <label className="block text-slate-200 text-sm font-semibold mb-2">Phone Number</label>
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(170px,220px)_1fr] gap-2">
                    <div className="relative" ref={phonePickerRef}>
                      <button
                        type="button"
                        onClick={() => setPhoneOpen((prev) => !prev)}
                        className="join-input w-full rounded-lg px-3 py-3 text-left flex items-center justify-between"
                      >
                        <span className="truncate">
                          {selectedPhoneOption ? selectedPhoneOption.label : 'Select country code'}
                        </span>
                        <span className="text-slate-400">{phoneOpen ? '^' : 'v'}</span>
                      </button>

                      {phoneOpen && (
                        <div className="absolute z-20 mt-2 w-[min(430px,90vw)] rounded-xl border border-slate-700 bg-[#061425] shadow-2xl overflow-hidden">
                          <div className="p-2 border-b border-slate-700">
                            <input
                              value={phoneSearch}
                              onChange={(event) => setPhoneSearch(event.target.value)}
                              placeholder="Search country or code (e.g. PH, +63)"
                              className="join-input w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400"
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {filteredPhoneOptions.map((option) => (
                              <button
                                key={`${option.iso2}-${option.code}`}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, phoneCountry: option.iso2 }));
                                  setPhoneOpen(false);
                                  setPhoneSearch('');
                                }}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                  option.iso2 === formData.phoneCountry
                                    ? 'bg-[#133020] text-[#FFC370]'
                                    : 'text-slate-200 hover:bg-slate-800'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      name="phoneLocal"
                      value={formData.phoneLocal}
                      onChange={handleChange}
                      type="tel"
                      placeholder="912345678"
                      className="join-input w-full rounded-lg px-4 py-3 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <label className="block text-slate-200 text-sm font-semibold mt-4 mb-2">Email Address</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="e.g. michael@example.com"
                    className="join-input w-full rounded-lg px-4 py-3 text-white placeholder:text-slate-400"
                  />
                  <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-slate-400">
                    Note: Enter proper email address.
                  </p>
                </div>
              </article>
            </div>

            <aside className="join-glass rounded-[1.25rem] p-5 sm:p-6 h-fit lg:sticky lg:top-24">
              <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-5 text-[#FFB347]">Application Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 text-sm font-semibold mb-2">Position Applied</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="join-input w-full rounded-lg px-4 py-3 text-white"
                    >
                      <option value="">Select position</option>
                      {POSITIONS.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-200 text-sm font-semibold mb-2">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="join-input w-full rounded-lg px-4 py-3 text-white"
                    >
                      <option value="">Select country</option>
                      {COMMON_COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 text-sm font-semibold mb-2">Current Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Quezon City"
                    className="join-input w-full rounded-lg px-4 py-3 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-center text-slate-100 font-semibold mb-3">Upload CV (PDF)</p>
                  <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`block rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[#FFB347] bg-[#10263f]'
                        : 'border-[#3f688e] bg-[#0a1f38]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleInputFileChange}
                    />
                    <div className="mx-auto h-40 w-40 rounded-full border border-[#4a758f] bg-[radial-gradient(circle,_rgba(36,133,113,0.38),_rgba(8,29,45,0.9))] flex items-center justify-center px-6">
                      <p className="text-sm leading-relaxed text-slate-100">
                        Click to upload or drag and drop
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-300">PDF only (max 10MB)</p>
                  </label>

                  {(uploadProgress > 0 || uploadStatus) && (
                    <div className="mt-3">
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#046241] to-[#FFB347] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-300">{uploadStatus}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#046241] to-[#FFB347] px-6 py-3.5 text-white font-extrabold shadow-[0_10px_24px_rgba(4,98,65,0.28)] hover:brightness-110 hover:-translate-y-0.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-90"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                        aria-hidden="true"
                      />
                      Sending Application...
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </button>

                {submitStatus && (
                  <p className={`text-sm ${submitStatus.includes('successfully') ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {submitStatus}
                  </p>
                )}
              </div>
            </aside>
          </form>
        </div>
      </section>
    </div>
  );
};

export default JoinUsNow;

