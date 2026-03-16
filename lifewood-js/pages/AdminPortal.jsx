import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

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
  { label: 'Dashboard', hint: 'Overview', isActive: true },
  { label: 'User Management', hint: 'Accounts', isActive: false },
  { label: 'Applicants', hint: 'Review queue', isActive: false },
  { label: 'Analytics', hint: 'Live reports', isActive: false },
  { label: 'Courses', hint: 'Training', isActive: false },
];

const METRIC_CARDS = [
  { title: 'Total users', value: 2, meta: 'New this week: 2' },
  { title: 'Active today', value: 2, meta: 'Pending invites: 0' },
  { title: 'Admin accounts', value: 1, meta: 'Super admins: 1' },
  { title: 'Total applicants', value: 3, meta: 'New this week: 3' },
  { title: 'Accepted applicants', value: 3, meta: 'Conversion tracking enabled' },
  { title: 'Data health', value: '99%', meta: 'Validation passing' },
];

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

const AdminLoginView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialReason = params.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <Link
          to="/home"
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#0f5a3f]/35 bg-[#edf5f0] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0f5a3f] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f5a3f]/55 hover:bg-white sm:left-6 sm:top-6"
        >
          <span aria-hidden="true">&larr;</span>
          Go Back
        </Link>

        <main className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-[#d7ddd9] bg-white/92 p-7 shadow-[0_26px_42px_rgba(19,48,32,0.16)] sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-castleton">Admin Portal</p>
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
                  placeholder="you@lifewood.com"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-dark-serpent">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                />
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

        <aside className="relative overflow-hidden rounded-[2rem] border border-[#0f4f3a]/30 bg-gradient-to-br from-[#0a3d2d] via-[#073526] to-[#022117] p-8 text-white shadow-[0_24px_46px_rgba(3,25,18,0.34)]">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#FFB347]/26 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#0f7150]/36 blur-3xl" />

          <p className="relative text-4xl font-black tracking-tight text-[#f5eedb]">lifewood</p>
          <p className="relative mt-5 inline-flex rounded-full border border-[#f5eedb]/30 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#f5eedb]">
            Admin Access
          </p>

          <h1 className="relative mt-6 text-3xl font-black leading-tight text-[#f8fbf9]">
            Enterprise
            <br />
            Control Center
          </h1>

          <p className="relative mt-4 max-w-xs text-sm leading-relaxed text-white/82">
            Manage users, monitor application flows, and supervise operations with secure, role-based controls.
          </p>

          <div className="relative mt-10 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Security</p>
              <p className="mt-1 text-xl font-black text-[#FFB347]">RBAC</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Status</p>
              <p className="mt-1 text-xl font-black text-[#FFB347]">Live</p>
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

  const expiryDate = getSessionExpiryDate(session);
  const expiryText = expiryDate ? expiryDate.toLocaleString() : 'Unknown';

  return (
    <div className="min-h-screen" style={adminBgStyle}>
      <section className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="relative overflow-hidden border-r border-[#e0e5e2] bg-gradient-to-b from-[#0a3e2d] via-[#063124] to-[#032118] px-5 py-6 text-white">
          <div className="absolute -top-20 -right-14 h-56 w-56 rounded-full bg-[#FFB347]/20 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#0f7150]/28 blur-3xl" />

          <div className="relative">
            <p className="text-[2.15rem] font-black leading-none text-[#f5eedb]">lifewood</p>
            <p className="mt-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.13em] text-[#f5eedb]">
              Admin Workspace
            </p>
          </div>

          <nav className="relative mt-8 space-y-2">
            {ADMIN_NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`w-full rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                  item.isActive
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
            className="relative mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#FFB347]/75 bg-[#042a1f] px-4 py-2.5 text-sm font-black uppercase tracking-[0.08em] text-[#FFB347] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0f5a3f] hover:text-white"
          >
            Log Out
          </button>
        </aside>

        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#102f22] sm:text-5xl">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-[#6e857b]">Live user insights | Auto-refreshing every 30s</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-[#ccd8d2] bg-white/80 px-5 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#244438] transition-colors hover:bg-white"
              >
                Refresh
              </button>
              <span className="rounded-full border border-[#ccd8d2] bg-white/80 px-5 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#244438]">
                Last Sync Just Now
              </span>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {METRIC_CARDS.map((metric) => (
              <article
                key={metric.title}
                className="rounded-2xl border border-[#d6dfda] bg-white/82 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.06)]"
              >
                <p className="text-sm text-[#425b51]">{metric.title}</p>
                <p className="mt-1 text-[2rem] leading-none font-black text-[#123424]">{metric.value}</p>
                <p className="mt-2 text-xs font-semibold text-[#8aa097]">{metric.meta}</p>
              </article>
            ))}
          </section>

          <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
            <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6f877d]">New Users</p>
                  <p className="text-sm text-[#6f877d]">Signups in the last 7 days</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">Live</span>
              </div>
              <div className="grid grid-cols-7 items-end gap-2">
                {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <div key={day} className="text-center">
                    <div className={`mx-auto rounded-md ${day === 'Wed' ? 'h-16 bg-[#0f7150]' : 'h-2 bg-[#0f7150]'}`} />
                    <p className="mt-1 text-[10px] text-[#9baca5]">{day}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6f877d]">Active Users</p>
                  <p className="text-sm text-[#6f877d]">Last seen in the last 7 days</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">Live</span>
              </div>
              <div className="grid grid-cols-7 items-end gap-2">
                {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <div key={day} className="text-center">
                    <div className={`mx-auto rounded-md ${day === 'Fri' ? 'h-16 bg-[#f2af4a]' : 'h-2 bg-[#f2af4a]'}`} />
                    <p className="mt-1 text-[10px] text-[#9baca5]">{day}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[2rem] leading-none font-black text-[#102f22]">New users</h2>
                <button type="button" className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {RECENT_USERS.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b border-[#e3e9e5] pb-3 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#dce8e2] text-sm font-black text-[#123626]">
                        {user.initials}
                      </span>
                      <div>
                        <p className="font-black leading-tight text-[#153324]">{user.name}</p>
                        <p className="text-sm text-[#7b9288]">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6f877d]">{user.id}</p>
                      <p className="text-xs text-[#6f877d]">{user.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
              <h3 className="text-3xl font-black leading-tight text-[#102f22]">Realtime analytics</h3>
              <p className="mt-1 text-sm text-[#7c938a]">Today, live overview</p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-[#e2e9e4] bg-[#f8fbf9] p-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#6f877d]">Role Mix</p>
                  <div className="space-y-1.5 text-sm font-bold text-[#1a3a2b]">
                    <p className="flex items-center justify-between"><span>Users</span><span>1</span></p>
                    <p className="flex items-center justify-between"><span>Admins</span><span>0</span></p>
                    <p className="flex items-center justify-between"><span>Super admins</span><span>1</span></p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#e2e9e4] bg-[#f8fbf9] p-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#6f877d]">Status</p>
                  <div className="space-y-1.5 text-sm font-bold text-[#1a3a2b]">
                    <p className="flex items-center justify-between"><span>Active</span><span>2</span></p>
                    <p className="flex items-center justify-between"><span>Pending</span><span>0</span></p>
                    <p className="flex items-center justify-between"><span>Suspended</span><span>0</span></p>
                  </div>
                </div>
              </div>
            </article>
          </section>
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
