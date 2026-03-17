import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  deleteJoinApplication,
  formatApplicantStatusLabel,
  getContactSubmissions,
  getJoinApplications,
  markContactSubmissionOpened,
  openApplicantStatusEmailDraft,
  updateJoinApplicationStatus,
} from '../utils/adminApplicantStore';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import {
  deleteApplicantFromSupabase,
  downloadApplicantCvBlobUrl,
  fetchApplicantsFromSupabase,
  findApplicantCvPathByEmailAndFileName,
  getApplicantCvPublicUrl,
  subscribeToApplicantsRealtime,
  unsubscribeApplicantsRealtime,
  updateApplicantStatusInSupabase,
} from '../services/supabaseApplications';

const ADMIN_ROLES = new Set(['Super Admin', 'Admin']);
const LOCAL_SESSION_KEY = 'lifewood.admin.session.local';
const SESSION_SESSION_KEY = 'lifewood.admin.session.session';
const DEFAULT_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const REMEMBER_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const MOCK_USERS = [
  {
    username: 'admin123',
    email: 'admin@lifewood.com',
    password: 'admin123',
    role: 'Admin',
    name: 'Lifewood Admin',
  },
];

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Overview' },
  { id: 'user-management', label: 'User Management', hint: 'Accounts' },
  { id: 'applicants', label: 'Applicants', hint: 'Review queue' },
  { id: 'courses', label: 'Courses', hint: 'Training' },
];

const ADMIN_VIEW_DASHBOARD = 'dashboard';
const ADMIN_VIEW_APPLICANTS = 'applicants';
const ADMIN_VIEW_COURSES = 'courses';

const RECENT_USERS = [
  {
    id: 'PH009',
    name: 'Justine Mhars Mumar',
    email: 'justinemharsmumar@gmail.com',
    date: 'Mar 11',
    initials: 'JM',
    status: 'Active',
  },
  {
    id: 'PH001',
    name: 'Justine Mharsu - Mumar',
    email: 'admin@gmail.com',
    date: 'Mar 11',
    initials: 'JM',
    status: 'Active',
  },
];

const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();

const getSessionStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
};

const getLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const safeJsonParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const generateToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `admin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readStoredSession = () => {
  const sessionStore = getSessionStorage();
  const localStore = getLocalStorage();

  const sessionValue = sessionStore ? safeJsonParse(sessionStore.getItem(SESSION_SESSION_KEY)) : null;
  if (sessionValue) return sessionValue;

  return localStore ? safeJsonParse(localStore.getItem(LOCAL_SESSION_KEY)) : null;
};

const clearStoredSession = () => {
  const sessionStore = getSessionStorage();
  const localStore = getLocalStorage();

  if (sessionStore) sessionStore.removeItem(SESSION_SESSION_KEY);
  if (localStore) localStore.removeItem(LOCAL_SESSION_KEY);
};

const persistSession = (session, rememberMe) => {
  const sessionStore = getSessionStorage();
  const localStore = getLocalStorage();
  const payload = JSON.stringify(session);

  if (rememberMe) {
    if (localStore) localStore.setItem(LOCAL_SESSION_KEY, payload);
    if (sessionStore) sessionStore.removeItem(SESSION_SESSION_KEY);
    return;
  }

  if (sessionStore) sessionStore.setItem(SESSION_SESSION_KEY, payload);
  if (localStore) localStore.removeItem(LOCAL_SESSION_KEY);
};

const isAdminRole = (role) => ADMIN_ROLES.has(role);

const createSessionPayload = (user, rememberMe) => {
  const now = Date.now();
  const durationMs = rememberMe ? REMEMBER_SESSION_DURATION_MS : DEFAULT_SESSION_DURATION_MS;
  return {
    token: generateToken(),
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    rememberMe: Boolean(rememberMe),
    issuedAt: now,
    expiresAt: now + durationMs,
  };
};

const validateCredentialsWithBackend = async ({ username, password }) => {
  const normalized = normalizeIdentifier(username);
  const found = MOCK_USERS.find((user) => {
    return (
      normalizeIdentifier(user.username) === normalized ||
      normalizeIdentifier(user.email) === normalized
    );
  });

  if (!found || found.password !== password) {
    return null;
  }

  return {
    username: found.username,
    email: found.email,
    role: found.role,
    name: found.name,
  };
};

const validateRoleWithBackend = async (role) => isAdminRole(role);

const isSessionExpired = (session) => {
  if (!session || !session.expiresAt) return true;
  return Date.now() >= Number(session.expiresAt);
};

const getSessionExpiryDate = (session) => {
  if (!session || !session.expiresAt) return null;
  return new Date(Number(session.expiresAt));
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

const getApplicantStatusBadgeClass = (status) => {
  if (status === 'hired') return 'border-[#0f7150]/35 bg-[#e5f5ee] text-[#0f5a3f]';
  if (status === 'rejected') return 'border-[#a11e2f]/35 bg-[#fdecef] text-[#8f1428]';
  return 'border-[#FFB347]/55 bg-[#fff4df] text-[#9a5a00]';
};

const formatGenderLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Not provided';
  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  if (normalized === 'prefer_not' || normalized === 'prefer-not-to-say') return 'Prefer not to say';
  return normalized
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getCvDisplayName = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'No CV uploaded';

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const parts = url.pathname.split('/').filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] || raw);
    } catch {
      return raw;
    }
  }

  const parts = raw.split('/').filter(Boolean);
  return parts[parts.length - 1] || raw;
};

const getApplicantCvUrl = (application) => {
  if (!application) return '';

  const directUrl = String(application.cvFileUrl || application.cvUrl || '').trim();
  if (directUrl) return directUrl;

  const storedCvValue = String(application.cvStoragePath || application.cvFileName || '').trim();
  if (!storedCvValue) return '';

  if (/^https?:\/\//i.test(storedCvValue)) {
    return storedCvValue;
  }

  return getApplicantCvPublicUrl(storedCvValue);
};

const toTimestamp = (value) => {
  if (!value) return Date.now();
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? Date.now() : time;
};

const mapSupabaseApplicantToAdminShape = (row) => {
  const status = row?.application_status || 'pending';
  const createdAt = toTimestamp(row?.created_at);
  const updatedAt = toTimestamp(row?.updated_at || row?.created_at);
  const rawCvValue = String(row?.cv_file_name || '').trim();
  const cvFileUrl = String(row?.cv_file_url || row?.cv_url || '').trim();
  const cvStoragePath = cvFileUrl
    ? ''
    : rawCvValue && !/^https?:\/\//i.test(rawCvValue) && rawCvValue.includes('/')
      ? rawCvValue
      : '';
  const cvFileName = rawCvValue || cvFileUrl ? getCvDisplayName(rawCvValue || cvFileUrl) : '';

  return {
    id: String(row?.id ?? ''),
    source: 'join',
    firstName: String(row?.first_name || '').trim(),
    lastName: String(row?.last_name || '').trim(),
    fullName: `${String(row?.first_name || '').trim()} ${String(row?.last_name || '').trim()}`.trim(),
    email: String(row?.email || '').trim(),
    phoneCountryCode: String(row?.phone_country_code || '').trim(),
    phoneLocal: String(row?.phone_local || '').trim(),
    phoneDisplay: `${String(row?.phone_country_code || '').trim()} ${String(row?.phone_local || '').trim()}`.trim(),
    gender: String(row?.gender || '').trim(),
    age: row?.age ?? '',
    position: String(row?.position_applied || '').trim(),
    country: String(row?.country || '').trim(),
    address: String(row?.address || '').trim(),
    cvFileName,
    cvStoragePath,
    cvFileUrl: cvFileUrl || (/^https?:\/\//i.test(rawCvValue) ? rawCvValue : ''),
    status,
    createdAt,
    updatedAt,
    reviewedAt: status === 'pending' ? null : updatedAt,
    reviewedBy: '',
  };
};

export const checkAdminAccess = () => {
  const session = readStoredSession();
  if (!session) return { allowed: false, reason: 'not_authenticated' };

  if (isSessionExpired(session)) {
    clearStoredSession();
    return { allowed: false, reason: 'session_expired' };
  }

  if (!isAdminRole(session.role)) {
    return { allowed: false, reason: 'forbidden' };
  }

  return { allowed: true, reason: null, session };
};

const loginAdmin = async ({ username, password, rememberMe }) => {
  const user = await validateCredentialsWithBackend({ username, password });
  if (!user) {
    return { ok: false, error: 'Invalid username or password.' };
  }

  const hasRoleAccess = await validateRoleWithBackend(user.role);
  if (!hasRoleAccess) {
    return { ok: false, error: 'You do not have permission to access the Admin Portal.' };
  }

  const session = createSessionPayload(user, rememberMe);
  persistSession(session, rememberMe);
  return { ok: true, session };
};

const logoutAdmin = () => {
  clearStoredSession();
};

const adminBgStyle = {
  background:
    'radial-gradient(circle at 10% 12%, rgba(255,179,71,0.2) 0%, rgba(255,179,71,0) 34%), radial-gradient(circle at 82% 88%, rgba(4,98,65,0.2) 0%, rgba(4,98,65,0) 38%), linear-gradient(145deg, #eef2ef 0%, #f7f8f6 46%, #ecf2ee 100%)',
};

const adminLoginInfoBgStyle = {
  backgroundImage: "url('https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=2000')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
};

const AdminLoginView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialReason = params.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const access = checkAdminAccess();
    if (access.allowed) {
      navigate('/admin', { replace: true });
      return;
    }

    if (initialReason === 'forbidden') {
      setError('You do not have permission to access the Admin Portal.');
      return;
    }

    if (initialReason === 'expired') {
      setError('Your session has expired. Please log in again.');
    }
  }, [initialReason, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await loginAdmin({ username, password, rememberMe });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Invalid username or password.');
      return;
    }

    const fromPath =
      typeof location.state?.from === 'string' && location.state.from.startsWith('/')
        ? location.state.from
        : '/admin';

    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-screen" style={adminBgStyle}>
      <section className="relative mx-auto grid min-h-screen w-full max-w-[1760px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[560px_620px] lg:items-center lg:justify-center lg:gap-0 lg:px-8 lg:py-0">
        <Link
          to="/home"
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#0f5a3f]/35 bg-[#edf5f0] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0f5a3f] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f5a3f]/55 hover:bg-white sm:left-6 sm:top-6"
        >
          <span aria-hidden="true">&larr;</span>
          Go Back
        </Link>

        <main className="flex items-center justify-center lg:items-stretch lg:justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-[#d7ddd9] bg-[#046241] p-7 shadow-[0_26px_42px_rgba(19,48,32,0.16)] sm:p-9 lg:flex lg:min-h-[520px] lg:flex-col lg:justify-center lg:rounded-r-none lg:border-r-0 xl:min-h-[600px]">
            <div className="relative -top-4 mb-2 flex w-full justify-center">
              <p className="rounded-2xl border border-white/65 bg-white/38 px-8 py-3 text-center text-[35pt] font-black uppercase leading-none tracking-[0.08em] text-[#FFB347] shadow-[0_10px_24px_rgba(15,90,63,0.12)] backdrop-blur-md">
                Admin Portal
              </p>
            </div>
            <h2 className="mt-2 text-4xl font-black text-dark-serpent">Sign In</h2>
            <p className="mt-2 text-sm text-[#5f756b]">Use your admin credentials to continue.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="admin-username" className="mb-2 block text-sm font-semibold text-dark-serpent">
                  Username (Email)
                </label>
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="you@gmail.com"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-dark-serpent">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 pr-12 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f756b] transition-colors hover:text-castleton"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.878 5.123A10.45 10.45 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.72 9.72 0 01-4.16 5.114M6.228 6.228A9.724 9.724 0 002.458 12c1.275 4.057 5.065 7 9.543 7 1.69 0 3.285-.42 4.677-1.161" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-dark-serpent">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#9fb4a9] text-castleton focus:ring-castleton/30"
                  />
                  Remember Me
                </label>

                <Link to="/admin/forgot-password" className="text-sm font-bold text-castleton transition-colors hover:text-dark-serpent">
                  Forgot Password?
                </Link>
              </div>

              {error && <p className="text-sm font-bold text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-dark-serpent px-6 py-3.5 text-saffron font-extrabold uppercase tracking-[0.1em] shadow-[0_12px_20px_rgba(19,48,32,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-castleton disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </div>
        </main>

        <aside
          className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-[#0f4f3a]/20 bg-[#f5eedb] p-8 text-[#123424] shadow-[0_24px_46px_rgba(3,25,18,0.18)] sm:p-9 lg:rounded-l-none xl:min-h-[600px] xl:p-10"
          style={adminLoginInfoBgStyle}
        >
          <img
            src="/assets/lifewood-logo.png"
            alt="Lifewood"
            className="relative h-14 w-auto object-contain"
          />
          <p className="relative mt-5 inline-flex rounded-full border border-[#0f4f3a]/22 bg-[#f5eedb] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#0f4f3a]">
            Admin Access
          </p>

          <h1 className="relative mt-6 text-4xl font-black leading-tight text-[#123424] sm:text-5xl xl:text-[3.35rem]">
            Enterprise
            <br />
            Control Center
          </h1>

          <p className="relative mt-5 max-w-md text-base leading-relaxed text-[#264538] xl:max-w-lg xl:text-lg">
            Manage users, monitor application flows, and supervise operations with secure, role-based controls.
          </p>

          <div className="relative mt-12 grid grid-cols-2 gap-4 xl:mt-14">
            <div className="rounded-2xl border border-[#0f4f3a]/18 bg-[#f5eedb] p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#2b4c3f]">Security</p>
              <p className="mt-2 text-2xl font-black text-[#0f5a3f]">RBAC</p>
            </div>
            <div className="rounded-2xl border border-[#0f4f3a]/18 bg-[#f5eedb] p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#2b4c3f]">Status</p>
              <p className="mt-2 text-2xl font-black text-[#0f5a3f]">Live</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

const AdminForgotPasswordView = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={adminBgStyle}>
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-[#d7ddd9] bg-white/92 p-8 shadow-[0_24px_42px_rgba(19,48,32,0.14)] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-castleton">Admin Portal</p>
          <h1 className="mt-2 text-4xl font-black text-dark-serpent">Reset Password</h1>
          <p className="mt-2 text-sm text-[#5f756b]">
            Enter your admin email and we will send reset instructions.
          </p>

          {submitted ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-xl border border-[#cae2d6] bg-[#edf5f0] p-4 text-sm font-semibold text-[#24513d]">
                If an admin account exists for {email || 'that email'}, reset instructions have been sent.
              </p>
              <Link to="/admin/login" className="inline-flex text-sm font-bold text-castleton transition-colors hover:text-dark-serpent">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-reset-email" className="mb-2 block text-sm font-semibold text-dark-serpent">
                  Email
                </label>
                <input
                  id="admin-reset-email"
                  type="email"
                  required
                  placeholder="you@lifewood.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-dark-serpent px-6 py-3 text-saffron font-extrabold uppercase tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5 hover:bg-castleton"
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

const AdminDashboardView = () => {
  const navigate = useNavigate();
  const access = checkAdminAccess();
  const session = access.session;
  const [activeView, setActiveView] = useState(ADMIN_VIEW_DASHBOARD);
  const [joinApplicants, setJoinApplicants] = useState([]);
  const [contactLeads, setContactLeads] = useState([]);
  const [openedContactIds, setOpenedContactIds] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(Date.now());
  const [emailNotice, setEmailNotice] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState('');
  const [cvPreviewLoading, setCvPreviewLoading] = useState(false);
  const [cvPreviewError, setCvPreviewError] = useState('');
  const cvPreviewBlobUrlRef = useRef('');

  const resetCvPreview = useCallback(() => {
    if (cvPreviewBlobUrlRef.current && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(cvPreviewBlobUrlRef.current);
    }
    cvPreviewBlobUrlRef.current = '';
    setCvPreviewUrl('');
    setCvPreviewLoading(false);
    setCvPreviewError('');
  }, []);

  const applyCvPreview = useCallback((nextUrl, isBlob = false) => {
    if (cvPreviewBlobUrlRef.current && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(cvPreviewBlobUrlRef.current);
    }
    cvPreviewBlobUrlRef.current = isBlob ? nextUrl : '';
    setCvPreviewUrl(nextUrl);
    setCvPreviewLoading(false);
    setCvPreviewError('');
  }, []);

  const loadApplicants = useCallback(async () => {
    setContactLeads(getContactSubmissions());

    if (isSupabaseConfigured) {
      const { data, error } = await fetchApplicantsFromSupabase();
      if (!error && Array.isArray(data)) {
        setJoinApplicants(data.map(mapSupabaseApplicantToAdminShape));
        setLastSyncAt(Date.now());
        return;
      }
    }

    setJoinApplicants(getJoinApplications());
    setLastSyncAt(Date.now());
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      const latestAccess = checkAdminAccess();
      if (latestAccess.allowed) return;

      const params = new URLSearchParams();
      if (latestAccess.reason === 'session_expired') params.set('reason', 'expired');
      if (latestAccess.reason === 'forbidden') params.set('reason', 'forbidden');

      navigate(`/admin/login${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }, 15000);

    return () => window.clearInterval(timerId);
  }, [navigate]);

  useEffect(() => {
    void loadApplicants();

    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('lifewood.admin.')) {
        void loadApplicants();
      }
    };

    const realtimeChannel = isSupabaseConfigured
      ? subscribeToApplicantsRealtime(() => {
          void loadApplicants();
        })
      : null;

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (realtimeChannel) {
        void unsubscribeApplicantsRealtime(realtimeChannel);
      }
    };
  }, [loadApplicants]);

  useEffect(() => {
    if (!selectedApplicant?.id) return;
    const latestApplicant = joinApplicants.find((item) => item.id === selectedApplicant.id);
    setSelectedApplicant(latestApplicant || null);
  }, [joinApplicants, selectedApplicant?.id]);

  useEffect(() => {
    if (selectedApplicant) return;
    resetCvPreview();
  }, [resetCvPreview, selectedApplicant]);

  useEffect(() => {
    return () => {
      if (cvPreviewBlobUrlRef.current && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(cvPreviewBlobUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedApplicant) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedApplicant(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApplicant]);

  if (!access.allowed) {
    const params = new URLSearchParams();
    if (access.reason === 'session_expired') params.set('reason', 'expired');
    if (access.reason === 'forbidden') params.set('reason', 'forbidden');
    return (
      <Navigate
        to={`/admin/login${params.toString() ? `?${params.toString()}` : ''}`}
        replace
        state={{ from: '/admin' }}
      />
    );
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const handleStatusUpdate = async (application, nextStatus) => {
    let updated = null;

    if (isSupabaseConfigured) {
      const { data, error } = await updateApplicantStatusInSupabase({
        id: application.id,
        status: nextStatus,
      });

      if (error) {
        setEmailNotice(`Unable to update applicant status: ${error.message || 'Unknown error'}`);
        return;
      }

      if (data) {
        updated = mapSupabaseApplicantToAdminShape(data);
      }
    } else {
      updated = updateJoinApplicationStatus({
        id: application.id,
        status: nextStatus,
        reviewedBy: session?.email || 'admin@lifewood.com',
      });
    }

    if (!updated) return;

    setJoinApplicants((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setLastSyncAt(Date.now());

    const label = formatApplicantStatusLabel(updated.status);
    const recipient = updated.fullName || `${updated.firstName || ''} ${updated.lastName || ''}`.trim() || 'Applicant';
    const emailOpened = openApplicantStatusEmailDraft({
      recipientEmail: updated.email,
      name: recipient,
      status: updated.status,
    });

    if (emailOpened) {
      setEmailNotice(`${recipient} marked as ${label}. A formatted email draft was opened.`);
      return;
    }

    setEmailNotice(`${recipient} marked as ${label}. Email draft could not be opened.`);
  };

  const handleDeleteRejectedApplication = async (application) => {
    if (!application || application.status !== 'rejected') return;

    if (isSupabaseConfigured) {
      const { error } = await deleteApplicantFromSupabase({ id: application.id });
      if (error) {
        setEmailNotice(`Unable to delete applicant: ${error.message || 'Unknown error'}`);
        return;
      }
    } else {
      const removed = deleteJoinApplication({ id: application.id });
      if (!removed) return;
    }

    setJoinApplicants((prev) => prev.filter((item) => item.id !== application.id));
    setLastSyncAt(Date.now());
    setEmailNotice(`${application.fullName || 'Applicant'} was removed from the rejected list.`);
  };

  const handleOpenApplicantDetails = (application) => {
    if (!application) return;
    resetCvPreview();
    setSelectedApplicant(application);
  };

  const handleCloseApplicantDetails = () => {
    resetCvPreview();
    setSelectedApplicant(null);
  };

  const handleViewApplicantCv = async (application) => {
    setCvPreviewLoading(true);
    setCvPreviewError('');

    const storedCvValue =
      application?.cvStoragePath ||
      application?.cvFileName ||
      application?.cvFileUrl ||
      '';
    const normalizedStoredCvValue = String(storedCvValue || '').trim();
    const isDirectUrl = /^https?:\/\//i.test(normalizedStoredCvValue);

    if (!isDirectUrl && normalizedStoredCvValue.includes('/')) {
      const { blobUrl, error } = await downloadApplicantCvBlobUrl(normalizedStoredCvValue);
      if (!error && blobUrl) {
        applyCvPreview(blobUrl, true);
        return;
      }
    }

    if (!isDirectUrl && normalizedStoredCvValue && !normalizedStoredCvValue.includes('/')) {
      const { path: resolvedPath } = await findApplicantCvPathByEmailAndFileName({
        applicantEmail: application?.email || '',
        fileName: normalizedStoredCvValue,
      });

      if (resolvedPath) {
        const { blobUrl, error } = await downloadApplicantCvBlobUrl(resolvedPath);
        if (!error && blobUrl) {
          setJoinApplicants((prev) =>
            prev.map((item) =>
              item.id === application.id
                ? { ...item, cvStoragePath: resolvedPath, cvFileName: getCvDisplayName(resolvedPath) }
                : item
            )
          );
          setSelectedApplicant((prev) =>
            prev && prev.id === application.id
              ? { ...prev, cvStoragePath: resolvedPath, cvFileName: getCvDisplayName(resolvedPath) }
              : prev
          );
          applyCvPreview(blobUrl, true);
          return;
        }
      }
    }

    const cvUrl = getApplicantCvUrl(application);
    if (cvUrl) {
      applyCvPreview(cvUrl, false);
      return;
    }

    setCvPreviewLoading(false);
    setCvPreviewError('CV file is not available for this applicant yet.');
    setEmailNotice('CV file is not available for this applicant yet.');
  };

  const handleOpenContactLead = (lead) => {
    if (!lead || !lead.id) return;

    setOpenedContactIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]));
    if (lead.isOpened) return;

    const updated = markContactSubmissionOpened({ id: lead.id });
    if (!updated) return;

    setContactLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setLastSyncAt(Date.now());
  };

  const applicantCounts = useMemo(() => {
    const pending = joinApplicants.filter((item) => item.status !== 'hired' && item.status !== 'rejected').length;
    const hired = joinApplicants.filter((item) => item.status === 'hired').length;
    const rejected = joinApplicants.filter((item) => item.status === 'rejected').length;

    return {
      pending,
      hired,
      rejected,
      totalJoin: joinApplicants.length,
      totalContact: contactLeads.length,
    };
  }, [contactLeads.length, joinApplicants]);

  const metricCards = useMemo(() => {
    return [
      { title: 'Total users', value: 2, meta: 'New this week: 2' },
      { title: 'Active today', value: 2, meta: 'Pending invites: 0' },
      { title: 'Admin accounts', value: 1, meta: 'Super admins: 1' },
      { title: 'Contact leads', value: applicantCounts.totalContact, meta: 'Who contacted via Contact form' },
      { title: 'Join applicants', value: applicantCounts.totalJoin, meta: `Pending review: ${applicantCounts.pending}` },
      { title: 'Hired applicants', value: applicantCounts.hired, meta: `Rejected: ${applicantCounts.rejected}` },
    ];
  }, [applicantCounts]);

  const dashboardJoinApplicants = useMemo(() => {
    return joinApplicants.slice(0, 8);
  }, [joinApplicants]);

  const expiryDate = getSessionExpiryDate(session);
  const expiryText = expiryDate ? expiryDate.toLocaleString() : 'Unknown';
  const isApplicantsView = activeView === ADMIN_VIEW_APPLICANTS;
  const isCoursesView = activeView === ADMIN_VIEW_COURSES;
  const lastSyncText = new Date(lastSyncAt).toLocaleTimeString();

  const headerTitle = isApplicantsView
    ? 'Applicants Review'
    : isCoursesView
      ? 'Courses Inbox'
      : 'Admin Dashboard';
  const headerSubtitle = isApplicantsView
    ? 'Review Join Us applications'
    : isCoursesView
      ? 'Review Contact Us messages'
      : 'Live user insights | Auto-refreshing every 30s';
  const selectedApplicantName = selectedApplicant
    ? selectedApplicant.fullName ||
      `${selectedApplicant.firstName || ''} ${selectedApplicant.lastName || ''}`.trim() ||
      'Applicant'
    : '';
  const selectedApplicantCvName = selectedApplicant
    ? getCvDisplayName(selectedApplicant.cvFileName || selectedApplicant.cvStoragePath || selectedApplicant.cvFileUrl)
    : 'No CV uploaded';
  const selectedApplicantCvSource = selectedApplicant
    ? String(
        selectedApplicant.cvStoragePath ||
          selectedApplicant.cvFileName ||
          selectedApplicant.cvFileUrl ||
          ''
      ).trim()
    : '';

  return (
    <div className="min-h-screen" style={adminBgStyle}>
      <section className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="relative flex flex-col overflow-hidden border-r border-[#e0e5e2] bg-gradient-to-b from-[#0a3e2d] via-[#063124] to-[#032118] px-5 py-6 text-white">
          <div className="absolute -top-20 -right-14 h-56 w-56 rounded-full bg-[#FFB347]/20 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#0f7150]/28 blur-3xl" />

          <div className="relative">
            <div className="inline-flex rounded-xl border border-white/70 bg-white/90 p-2 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
              <img
                src="/assets/lifewood-logo.png"
                alt="Lifewood"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="mt-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.13em] text-[#f5eedb]">
              Admin Workspace
            </p>
          </div>

          <nav className="relative mt-8 space-y-2">
            {ADMIN_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEmailNotice('');
                  if (item.id === ADMIN_VIEW_APPLICANTS) {
                    setActiveView(ADMIN_VIEW_APPLICANTS);
                    void loadApplicants();
                    return;
                  }
                  if (item.id === ADMIN_VIEW_COURSES) {
                    setActiveView(ADMIN_VIEW_COURSES);
                    void loadApplicants();
                    return;
                  }
                  setActiveView(ADMIN_VIEW_DASHBOARD);
                }}
                className={`w-full rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                  (activeView === ADMIN_VIEW_APPLICANTS && item.id === ADMIN_VIEW_APPLICANTS) ||
                  (activeView === ADMIN_VIEW_COURSES && item.id === ADMIN_VIEW_COURSES) ||
                  (activeView === ADMIN_VIEW_DASHBOARD && item.id === ADMIN_VIEW_DASHBOARD)
                    ? 'border-[#ffc370]/55 bg-[#0f5a3f] text-white shadow-[0_8px_18px_rgba(0,0,0,0.2)]'
                    : 'border-transparent bg-white/0 text-white/86 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <p className="text-sm font-extrabold">{item.label}</p>
                <p className="text-[11px] text-white/70">{item.hint}</p>
              </button>
            ))}
          </nav>

          <div className="relative mt-8 rounded-2xl border border-white/35 bg-[#042a1f]/80 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">Signed In</p>
            <p className="mt-2 text-xl font-black text-white">{session?.role || 'Admin'}</p>
            <p className="text-xs text-white/75">{session?.email || 'admin@lifewood.com'}</p>
            <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#FFB347]">
              Session expires: {expiryText}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="relative mt-auto inline-flex w-full items-center justify-center rounded-xl border border-[#FFB347]/75 bg-[#042a1f] px-4 py-2.5 text-sm font-black uppercase tracking-[0.08em] text-[#FFB347] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0f5a3f] hover:text-white"
          >
            Log Out
          </button>
        </aside>

        <main className="px-4 py-5 text-[#1a3a2b] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#102f22] sm:text-5xl">{headerTitle}</h1>
              <p className="mt-1 text-sm font-semibold text-[#4f685e]">{headerSubtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#c1d0c9] bg-white/95 px-5 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#1f3d30] shadow-[0_6px_12px_rgba(14,51,35,0.08)]">
                Last Sync {lastSyncText}
              </span>
            </div>
          </header>

          {emailNotice && (
            <p className="mb-3 rounded-xl border border-[#c8ddd3] bg-[#edf5f0] px-4 py-3 text-sm font-semibold text-[#1e4a37]">
              {emailNotice}
            </p>
          )}

          {isApplicantsView ? (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f877d]">Join Applicants</p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.totalJoin}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Submitted from Join Us form</p>
                </article>
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f877d]">Pending</p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.pending}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Awaiting review</p>
                </article>
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f877d]">Resolved</p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.hired + applicantCounts.rejected}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Hired and rejected updates sent</p>
                </article>
              </section>

              <section className="mt-3 grid grid-cols-1 gap-3">
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-3xl font-black leading-tight text-[#102f22]">Who Joined</h2>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">
                      {joinApplicants.length} Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {joinApplicants.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-4 text-sm text-[#6f877d]">
                        No Join Us applications yet.
                      </p>
                    ) : (
                      joinApplicants.map((application) => {
                        const status = application.status || 'pending';
                        const statusLabel = formatApplicantStatusLabel(status);
                        const fullName =
                          application.fullName ||
                          `${application.firstName || ''} ${application.lastName || ''}`.trim() ||
                          'Applicant';

                        return (
                          <article key={application.id} className="rounded-xl border border-[#dbe4df] bg-[#f8fbf9] p-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black text-[#163426]">{fullName}</p>
                                  <p className="text-[11px] font-semibold text-[#6f877d]">
                                    Submitted: {formatDateTime(application.createdAt)}
                                  </p>
                                  {application.reviewedAt && (
                                    <p className="text-[11px] font-semibold text-[#6f877d]">
                                      Updated: {formatDateTime(application.reviewedAt)}
                                    </p>
                                  )}
                                </div>
                                <p className="text-sm text-[#6f877d]">{application.email || 'No email'}</p>
                                <p className="text-xs text-[#6f877d]">
                                  {application.position || 'No position'} | {application.country || 'No country'}
                                </p>
                                <p className="text-xs text-[#6f877d]">{application.phoneDisplay || 'No phone number'}</p>
                                <p className="text-xs text-[#6f877d]">CV: {getCvDisplayName(application.cvFileName)}</p>
                              </div>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${getApplicantStatusBadgeClass(status)}`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenApplicantDetails(application)}
                                  className="rounded-full border border-[#0f5a3f]/35 bg-[#edf5f0] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e0eee7]"
                                >
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(application, 'hired')}
                                  disabled={status === 'hired'}
                                  className="rounded-full border border-[#0f7150]/45 bg-[#e8f6ef] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#d9efe4] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Accept
                                </button>
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(application, 'rejected')}
                                disabled={status === 'rejected'}
                                className="rounded-full border border-[#a11e2f]/45 bg-[#fdecef] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#8f1428] transition-colors hover:bg-[#fbdde2] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </div>

                              {status === 'rejected' && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRejectedApplication(application)}
                                    className="rounded-full border border-[#a11e2f]/55 bg-[#fff1f4] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#8f1428] transition-colors hover:bg-[#fde4ea]"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </article>
              </section>
            </>
          ) : isCoursesView ? (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6f877d]">Contact Leads</p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.totalContact}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Submitted from Contact Us</p>
                </article>
              </section>

              <section className="mt-3 grid grid-cols-1 gap-3">
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-3xl font-black leading-tight text-[#102f22]">Who Contacted</h2>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">
                      {contactLeads.length} Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {contactLeads.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-4 text-sm text-[#6f877d]">
                        No contact submissions yet.
                      </p>
                    ) : (
                      contactLeads.map((lead) => {
                        const isOpened = Boolean(lead.isOpened) || openedContactIds.includes(lead.id);
                        const messagePreview = (lead.message || 'No message provided.').slice(0, 96);

                        return (
                          <article
                            key={lead.id}
                            className={`rounded-xl border p-3 ${
                              isOpened
                                ? 'border-[#dbe4df] bg-[#f8fbf9]'
                                : 'border-[#c7dccf] bg-[#edf5f0] shadow-[0_8px_16px_rgba(15,90,63,0.08)]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-[#163426]">{lead.name || 'Unnamed contact'}</p>
                                <p className="text-sm text-[#6f877d]">{lead.email || 'No email'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f877d]">
                                  {formatDateTime(lead.createdAt)}
                                </p>
                                <span
                                  className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
                                    isOpened
                                      ? 'border-[#bfd3c9] bg-[#f4f8f6] text-[#426156]'
                                      : 'border-[#0f7150]/35 bg-[#e0f3ea] text-[#0f5a3f]'
                                  }`}
                                >
                                  {isOpened ? 'Opened' : 'Unread'}
                                </span>
                              </div>
                            </div>

                            <p className="mt-2 text-sm text-[#3d5a4e]">
                              {isOpened ? lead.message || 'No message provided.' : `${messagePreview}${(lead.message || '').length > 96 ? '...' : ''}`}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenContactLead(lead)}
                                disabled={isOpened}
                                className="rounded-full border border-[#0f7150]/30 bg-[#e8f6ef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#0f5a3f] transition-colors hover:bg-[#daf0e5] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isOpened ? 'Opened' : 'Open Message'}
                              </button>
                              {lead.openedAt && (
                                <p className="text-[11px] font-semibold text-[#6f877d]">
                                  Opened: {formatDateTime(lead.openedAt)}
                                </p>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </article>
              </section>
            </>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {metricCards.map((metric) => (
                  <article
                    key={metric.title}
                    className="rounded-2xl border border-[#c8d4cf] bg-white/94 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.08)]"
                  >
                    <p className="text-sm font-semibold text-[#355146]">{metric.title}</p>
                    <p className="mt-1 text-[2.1rem] leading-none font-black text-[#0f2f21]">{metric.value}</p>
                    <p className="mt-2 text-xs font-semibold text-[#5f7a6f]">{metric.meta}</p>
                  </article>
                ))}
              </section>

              <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
                <article className="rounded-2xl border border-[#c8d4cf] bg-white/94 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.08)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#446057]">New Users</p>
                      <p className="text-sm font-semibold text-[#58736a]">Signups in the last 7 days</p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">Live</span>
                  </div>
                  <div className="grid grid-cols-7 items-end gap-2">
                    {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                      <div key={day} className="text-center">
                        <div className={`mx-auto rounded-md ${day === 'Wed' ? 'h-16 bg-[#0f7150]' : 'h-2 bg-[#0f7150]'}`} />
                        <p className="mt-1 text-[10px] font-semibold text-[#6f877d]">{day}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-[#c8d4cf] bg-white/94 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.08)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#446057]">Active Users</p>
                      <p className="text-sm font-semibold text-[#58736a]">Last seen in the last 7 days</p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">Live</span>
                  </div>
                  <div className="grid grid-cols-7 items-end gap-2">
                    {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                      <div key={day} className="text-center">
                        <div className={`mx-auto rounded-md ${day === 'Fri' ? 'h-16 bg-[#f2af4a]' : 'h-2 bg-[#f2af4a]'}`} />
                        <p className="mt-1 text-[10px] font-semibold text-[#6f877d]">{day}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="mt-3 grid grid-cols-1 gap-3">
                <article className="rounded-2xl border border-[#c8d4cf] bg-white/94 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.08)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[2.1rem] leading-none font-black text-[#0f2f21]">New users</h2>
                    <button type="button" className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a] hover:text-[#123b2b]">
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dashboardJoinApplicants.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-4 text-sm text-[#6f877d]">
                        No Join Us applicants yet.
                      </p>
                    ) : (
                      dashboardJoinApplicants.map((applicant, index) => {
                        const fullName =
                          applicant.fullName ||
                          `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() ||
                          'Applicant';
                        const parts = fullName.split(/\s+/).filter(Boolean);
                        const initials =
                          (parts[0]?.[0] || 'A') + (parts[1]?.[0] || parts[0]?.[1] || 'P');
                        const recordCode = `AP${String(index + 1).padStart(3, '0')}`;
                        const dateText = applicant.createdAt
                          ? new Date(applicant.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A';

                        return (
                          <div
                            key={applicant.id}
                            className="flex items-center justify-between border-b border-[#d4dfda] pb-3 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d6e6de] text-sm font-black text-[#123626]">
                                {initials.toUpperCase()}
                              </span>
                              <div>
                                <p className="font-black leading-tight text-[#123424]">{fullName}</p>
                                <p className="text-sm font-medium text-[#5f7a6f]">{applicant.email || 'No email'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black uppercase tracking-[0.08em] text-[#4e675e]">{recordCode}</p>
                              <p className="text-xs font-semibold text-[#6f877d]">{dateText}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              </section>
            </>
          )}

          {selectedApplicant && (
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center bg-[#041c13]/65 px-4 py-6"
              onClick={handleCloseApplicantDetails}
            >
              <article
                className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#c6d8cf] bg-[#f8fbf9] p-5 shadow-[0_20px_42px_rgba(4,28,19,0.35)] sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#58736a]">
                      Applicant Credentials
                    </p>
                    <h3 className="mt-1 text-3xl font-black text-[#102f22]">{selectedApplicantName}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#5f7a6f]">
                      Submitted: {formatDateTime(selectedApplicant.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${getApplicantStatusBadgeClass(
                        selectedApplicant.status || 'pending'
                      )}`}
                    >
                      {formatApplicantStatusLabel(selectedApplicant.status || 'pending')}
                    </span>
                    <button
                      type="button"
                      onClick={handleCloseApplicantDetails}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c1d0c9] bg-white text-lg font-black text-[#355146] transition-colors hover:bg-[#edf5f0]"
                      aria-label="Close details"
                    >
                      x
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">First Name</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.firstName || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Last Name</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.lastName || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Email</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.email || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Phone</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.phoneDisplay || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Gender</p>
                    <p className="mt-1 font-bold text-[#163426]">{formatGenderLabel(selectedApplicant.gender)}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Age</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.age || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Position Applied</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.position || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Country</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.country || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-[#d5e1db] bg-white p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Address</p>
                  <p className="mt-1 font-bold text-[#163426]">{selectedApplicant.address || 'N/A'}</p>
                </div>

                <div className="mt-3 rounded-xl border border-[#d5e1db] bg-white p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">CV</p>
                  <p className="mt-1 font-bold text-[#163426]">{selectedApplicantCvName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewApplicantCv(selectedApplicant)}
                      disabled={!selectedApplicantCvSource}
                      className="rounded-full border border-[#0f5a3f]/35 bg-[#edf5f0] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e1efe8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      View CV
                    </button>
                    {!selectedApplicantCvSource && (
                      <p className="text-xs font-semibold text-[#6f877d]">
                        CV is not available for this applicant yet.
                      </p>
                    )}
                  </div>

                  {cvPreviewLoading && (
                    <p className="mt-3 text-sm font-semibold text-[#355146]">Loading CV preview...</p>
                  )}

                  {cvPreviewError && (
                    <p className="mt-3 text-sm font-semibold text-[#8f1428]">{cvPreviewError}</p>
                  )}

                  {cvPreviewUrl && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-[#cbdad3] bg-[#f4f8f6]">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d7e2dc] px-3 py-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#4c665c]">PDF Preview</p>
                        <a
                          href={cvPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-black uppercase tracking-[0.1em] text-[#0f5a3f] hover:text-[#0b402d]"
                        >
                          Open in new tab
                        </a>
                      </div>
                      <iframe
                        title={`CV Preview - ${selectedApplicantName}`}
                        src={`${cvPreviewUrl}#view=FitH`}
                        className="h-[560px] w-full bg-white"
                      />
                    </div>
                  )}
                </div>
              </article>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

const AdminPortal = () => {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === '/admin/login') return <AdminLoginView />;
  if (pathname === '/admin/forgot-password') return <AdminForgotPasswordView />;
  return <AdminDashboardView />;
};

export default AdminPortal;
