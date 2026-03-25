import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  archiveContactSubmission,
  blockContactEmail,
  deleteContactSubmission,
  deleteJoinApplication,
  formatApplicantStatusLabel,
  getBlockedContactEmails,
  getContactSubmissions,
  getJoinApplications,
  isContactEmailBlocked,
  markContactSubmissionOpened,
  openContactReplyEmailDraft,
  openApplicantStatusEmailDraft,
  unarchiveContactSubmission,
  unblockContactEmail,
  updateJoinApplicationStatus,
} from '../utils/adminApplicantStore';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import {
  downloadApplicantCvBlobUrl,
  fetchApplicantsFromSupabase,
  findApplicantCvPathByEmailAndFileName,
  getApplicantCvPublicUrl,
  subscribeToApplicantsRealtime,
  unsubscribeApplicantsRealtime,
  updateApplicantInterviewScheduleInSupabase,
  updateApplicantStatusInSupabase,
} from '../services/supabaseApplications';
import {
  authenticateAdminWithSupabase,
  getAdminProfileFromSupabase,
  hashAdminPassword,
  requestAdminPasswordResetInSupabase,
  resetAdminPasswordWithSupabaseToken,
  seedAdminProfileFromDefaults,
  uploadAdminAvatarToSupabase,
  updateAdminPasswordInSupabase,
  updateAdminProfileInSupabase,
} from '../services/supabaseAdminProfile';

const ADMIN_ROLES = new Set(['Super Admin', 'Admin']);
const LOCAL_SESSION_KEY = 'lifewood.admin.session.local';
const SESSION_SESSION_KEY = 'lifewood.admin.session.session';
const DEFAULT_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const REMEMBER_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_ADMIN_USERNAME = 'admin123';
const DEFAULT_ADMIN_EMAIL = 'admin@lifewood.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const HIDDEN_SUPABASE_APPLICANTS_KEY = 'lifewood.admin.hiddenSupabaseApplicants';
const ADMIN_PROFILE_OVERRIDES_KEY = 'lifewood.admin.profile.overrides';

const MOCK_USERS = [
  {
    username: DEFAULT_ADMIN_USERNAME,
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    role: 'Admin',
    name: 'Admin',
  },
];

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Overview' },
  { id: 'applicants', label: 'Applicants', hint: 'Review queue' },
  { id: 'courses', label: 'Contact Us', hint: 'Messages' },
];

const ADMIN_VIEW_DASHBOARD = 'dashboard';
const ADMIN_VIEW_APPLICANTS = 'applicants';
const ADMIN_VIEW_COURSES = 'courses';
const DASHBOARD_NEW_USERS_PREVIEW_LIMIT = 5;
const CONTACT_MESSAGES_PREVIEW_LIMIT = 3;
const DASHBOARD_REFRESH_INTERVAL_MS = 30 * 1000;

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

const updateStoredSessionProfile = ({ name, email } = {}) => {
  const currentSession = readStoredSession();
  if (!currentSession) return;

  const nextSession = { ...currentSession };

  if (typeof name === 'string' && String(name).trim()) {
    nextSession.name = String(name).trim();
  }

  if (typeof email === 'string' && String(email).trim()) {
    nextSession.email = String(email).trim();
  }

  persistSession(nextSession, Boolean(currentSession.rememberMe));
};

const readStoredAdminProfileOverrides = () => {
  const localStore = getLocalStorage();
  if (!localStore) return {};
  const parsed = safeJsonParse(localStore.getItem(ADMIN_PROFILE_OVERRIDES_KEY));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  return parsed;
};

const writeStoredAdminProfileOverrides = (overrides) => {
  const localStore = getLocalStorage();
  if (!localStore) return;
  localStore.setItem(ADMIN_PROFILE_OVERRIDES_KEY, JSON.stringify(overrides));
};

const getStoredAdminProfileOverride = ({ username, email } = {}) => {
  const overrides = readStoredAdminProfileOverrides();
  const keys = Array.from(
    new Set([normalizeIdentifier(username), normalizeIdentifier(email)].filter(Boolean))
  );

  for (const key of keys) {
    const entry = overrides[key];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return entry;
    }
  }

  return null;
};

const persistStoredAdminProfileOverride = ({ username, email, name, avatarUrl } = {}) => {
  const normalizedUsername = normalizeIdentifier(username);
  const normalizedEmail = normalizeIdentifier(email);
  const keys = Array.from(new Set([normalizedUsername, normalizedEmail].filter(Boolean)));
  if (keys.length === 0) return;

  const overrides = readStoredAdminProfileOverrides();
  const existing = keys.map((key) => overrides[key]).find((entry) => entry && typeof entry === 'object') || {};
  const next = {
    username: String(username || existing.username || '').trim(),
    email: String(email || existing.email || '').trim(),
    name: String(name || existing.name || '').trim(),
    avatarUrl:
      typeof avatarUrl === 'string'
        ? String(avatarUrl || '').trim()
        : String(existing.avatarUrl || '').trim(),
    updatedAt: Date.now(),
  };

  keys.forEach((key) => {
    overrides[key] = next;
  });

  if (next.username) {
    overrides[normalizeIdentifier(next.username)] = next;
  }
  if (next.email) {
    overrides[normalizeIdentifier(next.email)] = next;
  }

  writeStoredAdminProfileOverrides(overrides);
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
  if (!normalized) return null;

  if (isSupabaseConfigured) {
    const authResult = await authenticateAdminWithSupabase({
      identifier: normalized,
      password,
    });

    if (authResult.status === 'success' && authResult.data) {
      return {
        username: authResult.data.username,
        email: authResult.data.email,
        role: authResult.data.role,
        name: authResult.data.name,
        avatarUrl: authResult.data.avatarUrl,
      };
    }

    if (authResult.status === 'invalid_password') return null;
  }

  const found = MOCK_USERS.find(
    (user) =>
      normalizeIdentifier(user.username) === normalized ||
      normalizeIdentifier(user.email) === normalized
  );

  if (!found || found.password !== password) return null;

  if (isSupabaseConfigured) {
    const defaultPasswordHash = await hashAdminPassword(DEFAULT_ADMIN_PASSWORD);
    void seedAdminProfileFromDefaults({
      username: found.username,
      email: found.email,
      displayName: found.name,
      role: found.role,
      passwordHash: defaultPasswordHash,
    });
  }

  return {
    username: found.username,
    email: found.email,
    role: found.role,
    name: found.name,
    avatarUrl: '',
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

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read selected image file.'));
    reader.readAsDataURL(file);
  });

const padDatePart = (value) => String(value).padStart(2, '0');

const toDateInputValue = (date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

const toTimeInputValue = (date) => `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;

const INTERVIEW_WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const normalizeInterviewTimeValue = (timeValue) => {
  const raw = String(timeValue || '').trim();
  if (!raw) return '';

  const normalized = raw.toUpperCase();
  const meridiemMatch = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
  if (meridiemMatch) {
    const hours12 = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2]);
    const meridiem = meridiemMatch[3];
    if (hours12 < 1 || hours12 > 12 || minutes < 0 || minutes > 59) return '';

    let hours24 = hours12 % 12;
    if (meridiem === 'PM') hours24 += 12;
    return `${padDatePart(hours24)}:${padDatePart(minutes)}`;
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!twentyFourHourMatch) return '';
  const hours24 = Number(twentyFourHourMatch[1]);
  const minutes = Number(twentyFourHourMatch[2]);
  if (hours24 < 0 || hours24 > 23 || minutes < 0 || minutes > 59) return '';
  return `${padDatePart(hours24)}:${padDatePart(minutes)}`;
};

const formatInterviewTimeLabel = (timeValue) => {
  const normalized = normalizeInterviewTimeValue(timeValue);
  const match = normalized.match(/^(\d{2}):(\d{2})$/);
  if (!match) return 'Select time';

  const rawHours = Number(match[1]);
  const rawMinutes = Number(match[2]);
  const suffix = rawHours >= 12 ? 'PM' : 'AM';
  const displayHours = rawHours % 12 || 12;
  return `${padDatePart(displayHours)}:${padDatePart(rawMinutes)} ${suffix}`;
};

const formatInterviewDateLabel = (dateValue) => {
  const [yearText, monthText, dayText] = String(dateValue || '').split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!year || !month || !day) return 'Select date';

  const localDate = new Date(year, month - 1, day);
  if (
    Number.isNaN(localDate.getTime()) ||
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return 'Select date';
  }

  return localDate.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_PATTERN = /^[a-z0-9._%+-]+@gmail\.com$/i;

const getApplicantStatusBadgeClass = (status) => {
  if (status === 'hired') return 'text-[#0f5a3f]';
  if (status === 'scheduled_interview') return 'text-[#9a5a00]';
  if (status === 'rejected') return 'text-[#8f1428]';
  return 'text-[#9a5a00]';
};

const isApplicantReviewedStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  return (
    normalized === 'hired' ||
    normalized === 'rejected' ||
    normalized === 'scheduled_interview' ||
    normalized === 'scheduled'
  );
};

const getApplicantReviewLabel = (status) =>
  isApplicantReviewedStatus(status) ? 'Reviewed' : 'Not Reviewed';

const getApplicantReviewBadgeClass = (status) =>
  isApplicantReviewedStatus(status)
    ? 'text-[#0f5a3f]'
    : 'text-[#9a5a00]';

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
  const rawStatus = String(row?.application_status || '').trim().toLowerCase();
  const hasInterviewSchedule = Boolean(row?.interview_scheduled_at);
  const status =
    rawStatus === 'hired' || rawStatus === 'rejected' || rawStatus === 'scheduled_interview' || rawStatus === 'scheduled'
      ? rawStatus === 'scheduled' ? 'scheduled_interview' : rawStatus
      : hasInterviewSchedule
        ? 'scheduled_interview'
        : 'pending';
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
    interviewScheduledAt: row?.interview_scheduled_at ? String(row.interview_scheduled_at) : '',
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
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
};

const buildAdminResetUrlBase = () => {
  if (typeof window === 'undefined') return '#/admin/reset-password';
  return `${window.location.origin}${window.location.pathname}${window.location.search}#/admin/reset-password`;
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
    <div className="min-h-screen py-6 lg:flex lg:items-center" style={adminBgStyle}>
      <section className="relative mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[560px_620px] lg:items-stretch lg:justify-center lg:gap-0 lg:px-8 lg:py-0">
        <style>{`
          @keyframes adminAccessTypeLoop {
            0%, 12% { width: 0; }
            46%, 64% { width: var(--admin-access-target-width); }
            100% { width: 0; }
          }

          @keyframes adminAccessCaret {
            0%, 49% { border-right-color: #FFB347; }
            50%, 100% { border-right-color: transparent; }
          }

          .admin-access-typewriter {
            --admin-access-target-width: calc(12ch + 2em);
            display: inline-block;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
            border-right: 2px solid #FFB347;
            animation:
              adminAccessTypeLoop 4.8s steps(12, end) 0.2s infinite,
              adminAccessCaret 0.9s steps(1, end) infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .admin-access-typewriter {
              animation: none;
              width: var(--admin-access-target-width);
              border-right-color: transparent;
            }
          }
        `}</style>
        <Link
          to="/home"
          className="fixed left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-[#046241]/45 bg-[linear-gradient(135deg,rgba(245,238,219,0.9)_0%,rgba(232,244,237,0.88)_100%)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#0f5a3f] shadow-[0_0_0_1px_rgba(4,98,65,0.45),0_0_0_4px_rgba(4,98,65,0.14),0_10px_20px_rgba(15,90,63,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#046241]/68 hover:shadow-[0_0_0_1px_rgba(4,98,65,0.62),0_0_0_6px_rgba(4,98,65,0.2),0_14px_24px_rgba(15,90,63,0.2),inset_0_1px_0_rgba(255,255,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#046241]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5eedb] sm:left-6 sm:top-6"
        >
          <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0f5a3f]/12 text-[12px] leading-none">
            &larr;
          </span>
          Go Back
        </Link>

        <main className="flex items-center justify-center lg:items-stretch lg:justify-center">
		          <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#f5eedb]/34 bg-[#f5eedb] p-7 shadow-[0_24px_40px_rgba(19,48,32,0.24),inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[14px] backdrop-saturate-130 sm:p-9 lg:flex lg:h-full lg:min-h-[620px] lg:flex-col lg:justify-start lg:rounded-r-none lg:border-r-0">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_14%_8%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_86%_86%,rgba(255,195,112,0.12)_0%,rgba(255,195,112,0)_40%),linear-gradient(165deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_50%)]" />
            <div className="relative z-10 -top-4 mb-2 flex w-full justify-center">
              <p className="rounded-[1.1rem] border border-[#e2efe8]/85 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_46%),linear-gradient(120deg,rgba(175,202,187,0.94)_0%,rgba(154,186,167,0.93)_52%,rgba(168,197,179,0.94)_100%)] px-10 py-2.5 text-center text-[35pt] font-black uppercase leading-none tracking-[0.08em] text-[#FFB347] shadow-[0_10px_20px_rgba(4,98,65,0.24),inset_0_1px_0_rgba(255,255,255,0.52)] backdrop-blur-[14px]">
                Admin Portal
              </p>
            </div>
            <h2 className="relative z-10 mt-2 text-4xl font-black text-[#123424] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]">
              Sign In
            </h2>
            <p className="relative z-10 mt-2 max-w-md text-sm font-semibold text-[#355146]">
              Use your admin credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="relative z-10 mt-7 space-y-4">
              <div>
                <label htmlFor="admin-username" className="mb-2 block text-sm font-black tracking-[0.01em] text-[#123424]">
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
                  className="w-full rounded-xl border border-[#8aa59a]/55 bg-white/96 px-4 py-3 text-[#123424] placeholder:text-[#6f877d] shadow-[inset_0_1px_2px_rgba(18,52,36,0.06)] outline-none transition-all duration-200 focus:border-[#0f5a3f]/55 focus:ring-2 focus:ring-[#0f5a3f]/15"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-black tracking-[0.01em] text-[#123424]">
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
                    className="w-full rounded-xl border border-[#8aa59a]/55 bg-white/96 px-4 py-3 pr-12 text-[#123424] placeholder:text-[#6f877d] shadow-[inset_0_1px_2px_rgba(18,52,36,0.06)] outline-none transition-all duration-200 focus:border-[#0f5a3f]/55 focus:ring-2 focus:ring-[#0f5a3f]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#355146] transition-colors hover:text-[#0f5a3f]"
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
                <label className="inline-flex items-center gap-2 text-sm font-bold text-[#355146]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border border-[#7da190] bg-white accent-[#0f5a3f] focus:ring-[#0f5a3f]/25"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: '#7da190',
                      colorScheme: 'light',
                      appearance: 'auto',
                    }}
                  />
                  Remember Me
                </label>

                <Link
                  to="/admin/forgot-password"
                  className="text-sm font-black text-[#d8891c] transition-colors hover:text-[#b76d10]"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <p className="rounded-xl border border-[#e5b8be] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#8f1428]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#0f5a3f] px-6 py-3.5 text-[#f5c15d] font-extrabold uppercase tracking-[0.1em] shadow-[0_12px_20px_rgba(19,48,32,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#144d36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </div>
        </main>

	        <aside
	          className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-[#062b45] p-8 text-[#123424] shadow-[0_24px_46px_rgba(3,25,18,0.28)] sm:p-9 lg:h-full lg:min-h-[620px] lg:rounded-l-none xl:p-10"
	          style={adminLoginInfoBgStyle}
	        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(2,40,65,0.4)_0%,rgba(2,40,65,0.5)_42%,rgba(2,40,65,0.62)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_42%),radial-gradient(circle_at_80%_78%,rgba(255,179,71,0.1)_0%,rgba(255,179,71,0)_44%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <img
              src="/assets/lifewood-logo.png"
              alt="Lifewood"
              className="h-14 w-auto object-contain sm:h-16"
            />
            <p className="admin-access-typewriter mt-6 self-center text-center font-black uppercase tracking-[0.18em] text-[#FFB347]" style={{ fontSize: '20pt' }}>
              ADMIN ACCESS
            </p>

            <h1 className="mt-7 max-w-xl text-4xl font-black leading-tight text-[#FFB347] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] sm:text-5xl xl:text-[3.25rem]">
              Enterprise Control Center
            </h1>

            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-[#ffffff] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              Manage users, monitor application flows, and supervise operations with secure, role-based controls.
            </p>

            <div className="mt-6 max-w-[34rem] space-y-3">
              {[
                'User & role management',
                'Content & page management',
                'System activity monitoring',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-[#f4e7c8]/55 bg-[#f5eedb]/10 px-3 py-2.5 shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#FFB347]" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[#ffffff]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-3 gap-3 pt-8 xl:pt-10">
              <div className="rounded-2xl border border-[#f4e7c8]/72 bg-[#f5eedb]/12 p-3 text-center shadow-[0_10px_18px_rgba(0,0,0,0.15)]">
                <p className="text-xl font-black leading-none text-[#FFB347]">30+</p>
                <p className="mt-1 text-[11px] font-semibold text-[#ffffff]">Countries</p>
              </div>
              <div className="rounded-2xl border border-[#f4e7c8]/72 bg-[#f5eedb]/12 p-3 text-center shadow-[0_10px_18px_rgba(0,0,0,0.15)]">
                <p className="text-xl font-black leading-none text-[#FFB347]">~10K</p>
                <p className="mt-1 text-[11px] font-semibold text-[#ffffff]">Workforce</p>
              </div>
              <div className="rounded-2xl border border-[#f4e7c8]/72 bg-[#f5eedb]/12 p-3 text-center shadow-[0_10px_18px_rgba(0,0,0,0.15)]">
                <p className="text-xl font-black leading-none text-[#FFB347]">25+</p>
                <p className="mt-1 text-[11px] font-semibold text-[#ffffff]">Years</p>
              </div>
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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isSupabaseConfigured) {
      setError('Forgot password requires Supabase to be configured.');
      return;
    }

    setIsSubmitting(true);
    const result = await requestAdminPasswordResetInSupabase({
      identifier: email,
      resetUrlBase: buildAdminResetUrlBase(),
    });
    setIsSubmitting(false);

    if (result.error) {
      setError(String(result.error.message || '').trim() || 'Unable to send reset email.');
      return;
    }

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

              {error && (
                <p className="rounded-xl border border-[#f1c1c1] bg-[#fff1f1] p-4 text-sm font-semibold text-[#8f1428]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-dark-serpent px-6 py-3 text-saffron font-extrabold uppercase tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5 hover:bg-castleton"
              >
                {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

const AdminResetPasswordView = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const identifier = String(params.get('identifier') || '').trim();
  const token = String(params.get('token') || '').trim();
  const hasResetParams = Boolean(identifier && token);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!hasResetParams) {
      setError('This password reset link is incomplete.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Password reset requires Supabase to be configured.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetAdminPasswordWithSupabaseToken({
      identifier,
      token,
      newPassword,
    });
    setIsSubmitting(false);

    if (result.error) {
      setError(String(result.error.message || '').trim() || 'Unable to reset password.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={adminBgStyle}>
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-[#d7ddd9] bg-white/92 p-8 shadow-[0_24px_42px_rgba(19,48,32,0.14)] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-castleton">Admin Portal</p>
          <h1 className="mt-2 text-4xl font-black text-dark-serpent">Create New Password</h1>
          <p className="mt-2 text-sm text-[#5f756b]">
            Choose a new password for the admin account linked to your reset email.
          </p>

          {submitted ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-xl border border-[#cae2d6] bg-[#edf5f0] p-4 text-sm font-semibold text-[#24513d]">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <Link to="/admin/login" className="inline-flex text-sm font-bold text-castleton transition-colors hover:text-dark-serpent">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-new-reset-password" className="mb-2 block text-sm font-semibold text-dark-serpent">
                  New Password
                </label>
                <input
                  id="admin-new-reset-password"
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                />
              </div>

              <div>
                <label htmlFor="admin-confirm-reset-password" className="mb-2 block text-sm font-semibold text-dark-serpent">
                  Confirm Password
                </label>
                <input
                  id="admin-confirm-reset-password"
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#cfd8d1] bg-white px-4 py-3 text-dark-serpent outline-none transition-all duration-200 focus:border-castleton focus:ring-2 focus:ring-castleton/20"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-dark-serpent">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(event) => setShowPasswords(event.target.checked)}
                  className="h-4 w-4 rounded border border-[#cfd8d1] accent-[#0f5a3f]"
                />
                Show passwords
              </label>

              {error && (
                <p className="rounded-xl border border-[#f1c1c1] bg-[#fff1f1] p-4 text-sm font-semibold text-[#8f1428]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !hasResetParams}
                className="inline-flex w-full items-center justify-center rounded-full bg-dark-serpent px-6 py-3 text-saffron font-extrabold uppercase tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5 hover:bg-castleton disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Updating Password...' : 'Update Password'}
              </button>

              {!hasResetParams && (
                <p className="text-sm font-semibold text-[#8f1428]">
                  This reset link is missing required details.
                </p>
              )}

              <Link to="/admin/login" className="inline-flex text-sm font-bold text-castleton transition-colors hover:text-dark-serpent">
                Back to Login
              </Link>
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
  const [blockedContactEmails, setBlockedContactEmails] = useState([]);
  const [openedContactIds, setOpenedContactIds] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(Date.now());
  const [emailNotice, setEmailNotice] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedContactLead, setSelectedContactLead] = useState(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState('');
  const [cvPreviewLoading, setCvPreviewLoading] = useState(false);
  const [cvPreviewError, setCvPreviewError] = useState('');
  const cvPreviewBlobUrlRef = useRef('');
  const avatarInputRef = useRef(null);
  const [profileUsername, setProfileUsername] = useState(() => {
    const fallback = String(session?.username || DEFAULT_ADMIN_USERNAME).trim();
    return fallback || DEFAULT_ADMIN_USERNAME;
  });

  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [profileName, setProfileName] = useState(() => {
    const fallback = String(session?.name || session?.role || 'Admin').trim();
    return fallback || 'Admin';
  });
  const [nameDraft, setNameDraft] = useState(() => {
    const fallback = String(session?.name || session?.role || 'Admin').trim();
    return fallback || 'Admin';
  });
  const [nameError, setNameError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [profileEmail, setProfileEmail] = useState(() => {
    const fallback = String(session?.email || DEFAULT_ADMIN_EMAIL).trim();
    return fallback || DEFAULT_ADMIN_EMAIL;
  });
  const [emailDraft, setEmailDraft] = useState(() => {
    const fallback = String(session?.email || DEFAULT_ADMIN_EMAIL).trim();
    return fallback || DEFAULT_ADMIN_EMAIL;
  });
  const [profileEmailError, setProfileEmailError] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isShowingAllNewUsers, setIsShowingAllNewUsers] = useState(false);
  const [isShowingAllNotReviewedApplicants, setIsShowingAllNotReviewedApplicants] = useState(false);
  const [isShowingAllReviewedApplicants, setIsShowingAllReviewedApplicants] = useState(false);
  const [isShowingAllUnreadContactLeads, setIsShowingAllUnreadContactLeads] = useState(false);
  const [isShowingAllReadContactLeads, setIsShowingAllReadContactLeads] = useState(false);
  const [scheduleApplicant, setScheduleApplicant] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    tone: 'neutral',
  });
  const [contactDeleteDialog, setContactDeleteDialog] = useState({
    isOpen: false,
    lead: null,
  });
  const confirmationResolverRef = useRef(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewTimeText, setInterviewTimeText] = useState('');
  const [interviewScheduleError, setInterviewScheduleError] = useState('');
  const [isSendingScheduleEmail, setIsSendingScheduleEmail] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [calendarMonthCursor, setCalendarMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

  const closeConfirmationDialog = useCallback((confirmed) => {
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(Boolean(confirmed));
      confirmationResolverRef.current = null;
    }
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const requestConfirmation = useCallback(
    ({ title, message, confirmLabel = 'Confirm', tone = 'neutral' }) =>
      new Promise((resolve) => {
        if (confirmationResolverRef.current) {
          confirmationResolverRef.current(false);
          confirmationResolverRef.current = null;
        }

        confirmationResolverRef.current = resolve;
        setConfirmationDialog({
          isOpen: true,
          title: String(title || 'Confirm action'),
          message: String(message || 'Are you sure you want to continue?'),
          confirmLabel: String(confirmLabel || 'Confirm'),
          tone,
        });
      }),
    []
  );

  const persistProfileLocally = useCallback(
    ({ username, name, email, avatarUrl } = {}) => {
      const nextUsername =
        String(username ?? profileUsername ?? session?.username ?? DEFAULT_ADMIN_USERNAME).trim() ||
        DEFAULT_ADMIN_USERNAME;
      const nextName =
        String(name ?? profileName ?? session?.name ?? session?.role ?? 'Admin').trim() || 'Admin';
      const nextEmail =
        String(email ?? profileEmail ?? session?.email ?? DEFAULT_ADMIN_EMAIL).trim() ||
        DEFAULT_ADMIN_EMAIL;
      const nextAvatarUrl = String(avatarUrl ?? profileAvatarUrl ?? '').trim();

      persistStoredAdminProfileOverride({
        username: nextUsername,
        name: nextName,
        email: nextEmail,
        avatarUrl: nextAvatarUrl,
      });
    },
    [
      profileEmail,
      profileName,
      profileAvatarUrl,
      profileUsername,
      session?.email,
      session?.name,
      session?.role,
      session?.username,
    ]
  );

  const openContactDeleteDialog = useCallback((lead) => {
    if (!lead?.id) return;
    setContactDeleteDialog({
      isOpen: true,
      lead,
    });
  }, []);

  const closeContactDeleteDialog = useCallback(() => {
    setContactDeleteDialog({
      isOpen: false,
      lead: null,
    });
  }, []);

  const readHiddenSupabaseApplicantIds = useCallback(() => {
    const store = getLocalStorage();
    if (!store) return [];
    const parsed = safeJsonParse(store.getItem(HIDDEN_SUPABASE_APPLICANTS_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => String(value || '').trim())
      .filter(Boolean);
  }, []);

  const writeHiddenSupabaseApplicantIds = useCallback((ids) => {
    const store = getLocalStorage();
    if (!store) return;

    const normalized = Array.from(
      new Set(
        (Array.isArray(ids) ? ids : [])
          .map((value) => String(value || '').trim())
          .filter(Boolean)
      )
    );

    store.setItem(HIDDEN_SUPABASE_APPLICANTS_KEY, JSON.stringify(normalized));
  }, []);

  const hideSupabaseApplicantLocally = useCallback(
    (id) => {
      const normalizedId = String(id || '').trim();
      if (!normalizedId) return false;
      const existing = readHiddenSupabaseApplicantIds();
      if (existing.includes(normalizedId)) return true;
      writeHiddenSupabaseApplicantIds([...existing, normalizedId]);
      return true;
    },
    [readHiddenSupabaseApplicantIds, writeHiddenSupabaseApplicantIds]
  );

  const filterHiddenSupabaseApplicants = useCallback(
    (applicants) => {
      const hiddenIds = new Set(readHiddenSupabaseApplicantIds());
      if (!hiddenIds.size) return applicants;

      return (Array.isArray(applicants) ? applicants : []).filter((item) => {
        const id = String(item?.id || '').trim();
        if (!id) return true;
        const isLocalOnly = id.startsWith('applicant-');
        if (isLocalOnly) return true;
        return !hiddenIds.has(id);
      });
    },
    [readHiddenSupabaseApplicantIds]
  );

  const loadApplicants = useCallback(async () => {
    setContactLeads(getContactSubmissions());
    setBlockedContactEmails(getBlockedContactEmails());

    if (isSupabaseConfigured) {
      const { data, error } = await fetchApplicantsFromSupabase();
      if (!error && Array.isArray(data)) {
        const mappedApplicants = data.map(mapSupabaseApplicantToAdminShape);
        setJoinApplicants(filterHiddenSupabaseApplicants(mappedApplicants));
        setLastSyncAt(Date.now());
        return;
      }
    }

    setJoinApplicants(filterHiddenSupabaseApplicants(getJoinApplications()));
    setLastSyncAt(Date.now());
  }, [filterHiddenSupabaseApplicants]);

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
    const refreshId = window.setInterval(() => {
      void loadApplicants();
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(refreshId);
  }, [loadApplicants]);

  useEffect(() => {
    let isMounted = true;

    const applyProfile = (profile) => {
      if (!isMounted || !profile) return;

      const nextUsername =
        String(profile.username || session?.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;
      const nextName = String(profile.name || session?.name || session?.role || 'Admin').trim() || 'Admin';
      const nextEmail =
        String(profile.email || session?.email || DEFAULT_ADMIN_EMAIL).trim() || DEFAULT_ADMIN_EMAIL;

      setProfileUsername(nextUsername);
      setProfileName(nextName);
      setNameDraft(nextName);
      setProfileEmail(nextEmail);
      setEmailDraft(nextEmail);
      setProfileAvatarUrl(String(profile.avatarUrl || '').trim());
      updateStoredSessionProfile({ name: nextName, email: nextEmail });
    };

    const hydrateAdminProfile = async () => {
      const fallbackUsername =
        String(session?.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;
      const fallbackEmail =
        String(session?.email || DEFAULT_ADMIN_EMAIL).trim() || DEFAULT_ADMIN_EMAIL;
      const fallbackRole = String(session?.role || 'Admin').trim() || 'Admin';
      const fallbackName =
        String(session?.name || fallbackRole || 'Admin').trim() || 'Admin';
      const localOverride = getStoredAdminProfileOverride({
        username: fallbackUsername,
        email: fallbackEmail,
      });
      const applyLocalOverride = (profile) => {
        if (!localOverride) return profile;
        return {
          ...profile,
          username:
            String(localOverride.username || profile?.username || '').trim() ||
            String(profile?.username || '').trim(),
          name:
            String(localOverride.name || profile?.name || '').trim() ||
            String(profile?.name || '').trim(),
          email:
            String(localOverride.email || profile?.email || '').trim() ||
            String(profile?.email || '').trim(),
          avatarUrl:
            String(localOverride.avatarUrl || '').trim() || String(profile?.avatarUrl || '').trim(),
        };
      };
      const fallbackProfile = applyLocalOverride({
        username: fallbackUsername,
        name: fallbackName,
        email: fallbackEmail,
        avatarUrl: '',
      });

      if (!isSupabaseConfigured) {
        applyProfile(fallbackProfile);
        return;
      }

      const profileResult = await getAdminProfileFromSupabase({
        identifier: fallbackUsername || fallbackEmail,
      });

      if (profileResult.error) {
        if (isMounted) {
          applyProfile(fallbackProfile);
          setEmailNotice(`Profile sync warning: ${profileResult.error.message || 'Unable to load admin profile.'}`);
        }
        return;
      }

      if (profileResult.data) {
        applyProfile(applyLocalOverride(profileResult.data));
        return;
      }

      const defaultPasswordHash = await hashAdminPassword(DEFAULT_ADMIN_PASSWORD);
      const seedResult = await seedAdminProfileFromDefaults({
        username: fallbackUsername,
        email: fallbackEmail,
        displayName: fallbackName,
        role: fallbackRole,
        avatarUrl: '',
        passwordHash: defaultPasswordHash,
      });

      if (!isMounted) return;

      if (seedResult.error) {
        applyProfile(fallbackProfile);
        setEmailNotice(`Profile sync warning: ${seedResult.error.message || 'Unable to create admin profile.'}`);
        return;
      }

      if (seedResult.data) {
        applyProfile(applyLocalOverride(seedResult.data));
      }
    };

    void hydrateAdminProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.email, session?.name, session?.role, session?.username]);

  useEffect(() => {
    if (!selectedApplicant?.id) return;
    const latestApplicant = joinApplicants.find((item) => item.id === selectedApplicant.id);
    setSelectedApplicant(latestApplicant || null);
  }, [joinApplicants, selectedApplicant?.id]);

  useEffect(() => {
    if (!selectedContactLead?.id) return;
    const latestLead = contactLeads.find((item) => item.id === selectedContactLead.id);
    setSelectedContactLead(latestLead || null);
  }, [contactLeads, selectedContactLead?.id]);

  useEffect(() => {
    if (!scheduleApplicant?.id) return;
    const latestApplicant = joinApplicants.find((item) => item.id === scheduleApplicant.id);
    setScheduleApplicant(latestApplicant || null);
  }, [joinApplicants, scheduleApplicant?.id]);

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
    if (!selectedApplicant && !selectedContactLead && !contactDeleteDialog.isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (contactDeleteDialog.isOpen) {
          closeContactDeleteDialog();
          return;
        }
        setSelectedApplicant(null);
        setSelectedContactLead(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeContactDeleteDialog, contactDeleteDialog.isOpen, selectedApplicant, selectedContactLead]);

  useEffect(() => {
    if (!isPasswordModalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPasswordModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPasswordModalOpen]);

  useEffect(() => {
    if (!isProfilePreviewOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfilePreviewOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfilePreviewOpen]);

  useEffect(() => {
    if (!confirmationDialog.isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeConfirmationDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeConfirmationDialog, confirmationDialog.isOpen]);

  useEffect(() => {
    return () => {
      if (confirmationResolverRef.current) {
        confirmationResolverRef.current(false);
        confirmationResolverRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!scheduleApplicant) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSendingScheduleEmail) {
        setScheduleApplicant(null);
        setInterviewScheduleError('');
        setIsCalendarOpen(false);
        setIsTimePickerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSendingScheduleEmail, scheduleApplicant]);

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
    if (!application) return;

    const currentStatus = String(application.status || '').trim().toLowerCase();
    if (currentStatus === 'rejected' && nextStatus === 'hired') {
      setEmailNotice('Rejected applicants cannot be accepted.');
      return;
    }

    if (nextStatus === 'hired') {
      const applicantName =
        application?.fullName ||
        `${application?.firstName || ''} ${application?.lastName || ''}`.trim() ||
        'this applicant';

      const confirmedAccept = await requestConfirmation({
        title: 'Confirm Accept',
        message: `Are you sure you want to accept ${applicantName}?`,
        confirmLabel: 'Accept',
        tone: 'success',
      });
      if (!confirmedAccept) return;
    }

    if (nextStatus === 'rejected') {
      const applicantName =
        application?.fullName ||
        `${application?.firstName || ''} ${application?.lastName || ''}`.trim() ||
        'this applicant';

      const confirmedReject = await requestConfirmation({
        title: 'Confirm Reject',
        message: `Are you sure you want to reject ${applicantName}?`,
        confirmLabel: 'Reject',
        tone: 'danger',
      });
      if (!confirmedReject) return;
    }

    let updated = null;
    const isLocalOnlyRecord = String(application?.id || '').startsWith('applicant-');

    if (!isLocalOnlyRecord) {
      if (!isSupabaseConfigured) {
        setEmailNotice('Unable to update applicant status in database: Supabase is not configured.');
        return;
      }

      const { data, error } = await updateApplicantStatusInSupabase({
        id: application.id,
        status: nextStatus,
      });

      if (error) {
        setEmailNotice(`Unable to update applicant status in database: ${error?.message || 'Unknown error.'}`);
        return;
      }

      updated = {
        ...application,
        status: nextStatus,
        reviewedAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      updated = updateJoinApplicationStatus({
        id: application.id,
        status: nextStatus,
        reviewedBy: profileEmail || session?.email || DEFAULT_ADMIN_EMAIL,
      });
      if (!updated) {
        setEmailNotice('Unable to update local applicant status.');
        return;
      }
    }

    setJoinApplicants((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setLastSyncAt(Date.now());
    void loadApplicants();

    const label = formatApplicantStatusLabel(updated.status);
    const recipient = updated.fullName || `${updated.firstName || ''} ${updated.lastName || ''}`.trim() || 'Applicant';
    const emailResult = await openApplicantStatusEmailDraft({
      recipientEmail: updated.email,
      name: recipient,
      status: updated.status,
      position: updated.position || '',
    });
    const emailNoticeText =
      emailResult?.mode === 'emailjs'
        ? 'Email notification was sent.'
        : 'Email notification could not be sent. Please check EmailJS configuration.';
    setEmailNotice(`${recipient} marked as ${label}. ${emailNoticeText}`);
  };

  const handleScheduleInterview = (application) => {
    if (!application) return;

    const nextSlot = new Date(Date.now() + 60 * 60 * 1000);
    nextSlot.setMinutes(0, 0, 0);

    setScheduleApplicant(application);
    setInterviewDate(toDateInputValue(nextSlot));
    const nextTime = toTimeInputValue(nextSlot);
    setInterviewTime(nextTime);
    setInterviewTimeText(formatInterviewTimeLabel(nextTime));
    setInterviewScheduleError('');
    setCalendarMonthCursor(new Date(nextSlot.getFullYear(), nextSlot.getMonth(), 1));
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
  };

  const closeScheduleInterviewModal = () => {
    if (isSendingScheduleEmail) return;
    setScheduleApplicant(null);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewTimeText('');
    setInterviewScheduleError('');
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
  };

  const handleSelectInterviewDate = (dateValue) => {
    setInterviewDate(dateValue);
    setInterviewScheduleError('');
    setIsCalendarOpen(false);
  };

  const handleSelectInterviewTime = (timeValue) => {
    setInterviewTime(timeValue);
    setInterviewScheduleError('');
    setIsTimePickerOpen(false);
  };

  const handleCalendarMonthShift = (monthOffset) => {
    setCalendarMonthCursor((previous) => new Date(previous.getFullYear(), previous.getMonth() + monthOffset, 1));
  };

  const handleScheduleInterviewSubmit = async (event) => {
    event.preventDefault();
    if (!scheduleApplicant) return;

    const selectedDate = String(interviewDate || '').trim();
    const selectedTime = normalizeInterviewTimeValue(interviewTime || interviewTimeText);

    if (!selectedDate) {
      setInterviewScheduleError('Please select an interview date.');
      return;
    }

    if (!selectedTime) {
      setInterviewScheduleError('Please select an interview time.');
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (Number.isNaN(selectedDateTime.getTime())) {
      setInterviewScheduleError('Invalid interview schedule. Please select a valid date and time.');
      return;
    }

    if (selectedDateTime.getTime() < Date.now()) {
      setInterviewScheduleError('Interview schedule must be in the future.');
      return;
    }

    const recipient =
      scheduleApplicant.fullName ||
      `${scheduleApplicant.firstName || ''} ${scheduleApplicant.lastName || ''}`.trim() ||
      'Applicant';
    const interviewDateTimeText = selectedDateTime.toLocaleString();
    const interviewTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
    const isLocalOnlyRecord = String(scheduleApplicant?.id || '').startsWith('applicant-');

    setIsSendingScheduleEmail(true);
    setInterviewScheduleError('');

    if (!isLocalOnlyRecord) {
      if (!isSupabaseConfigured) {
        setIsSendingScheduleEmail(false);
        setEmailNotice('Unable to save interview schedule in database: Supabase is not configured.');
        return;
      }

      const { error } = await updateApplicantInterviewScheduleInSupabase({
        id: scheduleApplicant.id,
        scheduleIso: selectedDateTime.toISOString(),
      });

      if (error) {
        setIsSendingScheduleEmail(false);
        setEmailNotice(`Unable to save interview schedule in database: ${error.message || 'Unknown error'}`);
        return;
      }
    } else {
      const localScheduled = updateJoinApplicationStatus({
        id: scheduleApplicant.id,
        status: 'scheduled_interview',
        reviewedBy: profileEmail || session?.email || DEFAULT_ADMIN_EMAIL,
      });

      if (!localScheduled) {
        setIsSendingScheduleEmail(false);
        setEmailNotice('Unable to save local interview schedule.');
        return;
      }
    }

    setJoinApplicants((prev) =>
      prev.map((item) =>
        item.id === scheduleApplicant.id
          ? {
              ...item,
              status: 'scheduled_interview',
              interviewScheduledAt: selectedDateTime.toISOString(),
              reviewedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : item
      )
    );
    setLastSyncAt(Date.now());
    void loadApplicants();

    const emailResult = await openApplicantStatusEmailDraft({
      recipientEmail: scheduleApplicant.email,
      name: recipient,
      status: 'schedule_interview',
      position: scheduleApplicant.position || '',
      interviewDate: selectedDate,
      interviewTime: selectedTime,
      interviewDateTimeIso: selectedDateTime.toISOString(),
      interviewDateTimeText,
      interviewTimezone,
    });

    if (emailResult?.mode === 'emailjs') {
      setEmailNotice(
        `Interview scheduled for ${recipient} on ${interviewDateTimeText}. Status was saved in database and email notification was sent.`
      );
      setIsSendingScheduleEmail(false);
      closeScheduleInterviewModal();
      return;
    }

    setEmailNotice(
      `Interview schedule for ${recipient} was saved in database as ${interviewDateTimeText}, but email notification could not be sent. Please check EmailJS configuration.`
    );
    setIsSendingScheduleEmail(false);
  };

  const handleDeleteRejectedApplication = async (application) => {
    if (!application || application.status !== 'rejected') return;

    const applicantName =
      application.fullName ||
      `${application.firstName || ''} ${application.lastName || ''}`.trim() ||
      'this applicant';
    const confirmedDelete = await requestConfirmation({
      title: 'Confirm Delete',
      message: `Delete ${applicantName} from the rejected list? This action cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!confirmedDelete) return;

    const isLocalOnlyRecord = String(application?.id || '').startsWith('applicant-');

    if (isLocalOnlyRecord) {
      const removed = deleteJoinApplication({ id: application.id });
      if (!removed) return;
    } else {
      const hidden = hideSupabaseApplicantLocally(application.id);
      if (!hidden) {
        setEmailNotice('Unable to remove applicant from the website list.');
        return;
      }
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

  const markContactLeadAsOpened = (lead) => {
    if (!lead || !lead.id) return lead || null;

    setOpenedContactIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]));
    if (lead.isOpened) return lead;

    const updated = markContactSubmissionOpened({ id: lead.id });
    if (!updated) return lead;

    setContactLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setLastSyncAt(Date.now());
    return updated;
  };

  const handleViewContactLead = (lead) => {
    const nextLead = markContactLeadAsOpened(lead);
    if (!nextLead) return;
    setSelectedContactLead(nextLead);
  };

  const handleReplyToContactLead = (lead) => {
    const recipientEmail = String(lead?.email || '').trim();
    if (!recipientEmail) {
      setEmailNotice('This contact does not have a valid email address.');
      return;
    }

    if (!EMAIL_PATTERN.test(recipientEmail)) {
      setEmailNotice('This contact email format is invalid.');
      return;
    }

    const result = openContactReplyEmailDraft({
      recipientName: String(lead?.name || '').trim() || 'there',
      recipientEmail,
      originalMessage: String(lead?.message || '').trim(),
      submittedAt: lead?.createdAt,
      adminName: String(profileName || 'Lifewood Support Team').trim() || 'Lifewood Support Team',
    });

    if (!result?.ok) {
      setEmailNotice('Unable to open reply draft. Please verify email settings on this device.');
      return;
    }

    setEmailNotice('Reply draft opened with the standard Lifewood email format.');
  };

  const handleCloseContactLeadDetails = () => {
    setSelectedContactLead(null);
  };

  const handleBlockContactLeadEmail = async (lead) => {
    const email = String(lead?.email || '').trim().toLowerCase();
    if (!email) {
      setEmailNotice('Contact email is missing. Unable to block this sender.');
      return;
    }

    if (!GMAIL_PATTERN.test(email)) {
      setEmailNotice('Only Gmail addresses can be blocked from Contact Us.');
      return;
    }

    if (isContactEmailBlocked(email)) {
      setEmailNotice(`${email} is already blocked from Contact Us submissions.`);
      return;
    }

    const confirmed = await requestConfirmation({
      title: 'Block Gmail',
      message: `Block ${email} from sending new Contact Us messages?`,
      confirmLabel: 'Block',
      tone: 'danger',
    });
    if (!confirmed) return;

    const blocked = blockContactEmail({ email });
    if (!blocked) {
      setEmailNotice('Unable to block this Gmail address.');
      return;
    }

    setBlockedContactEmails(getBlockedContactEmails());
    setEmailNotice(`${email} is now blocked from Contact Us submissions.`);
  };

  const handleUnblockContactLeadEmail = async (lead) => {
    const email = String(lead?.email || '').trim().toLowerCase();
    if (!email) {
      setEmailNotice('Contact email is missing. Unable to unblock this sender.');
      return;
    }

    const confirmed = await requestConfirmation({
      title: 'Unblock Gmail',
      message: `Allow ${email} to send Contact Us messages again?`,
      confirmLabel: 'Unblock',
      tone: 'success',
    });
    if (!confirmed) return;

    const unblocked = unblockContactEmail({ email });
    if (!unblocked) {
      setEmailNotice(`${email} is not currently blocked.`);
      return;
    }

    setBlockedContactEmails(getBlockedContactEmails());
    setEmailNotice(`${email} can now send Contact Us messages again.`);
  };

  const handleArchiveContactLead = (lead) => {
    if (!lead?.id) return;
    const archived = archiveContactSubmission({ id: lead.id });
    if (!archived) return;

    setContactLeads((prev) => prev.map((item) => (item.id === lead.id ? archived : item)));
    setSelectedContactLead((prev) => (prev?.id === lead.id ? null : prev));
    setLastSyncAt(Date.now());
    setEmailNotice(`${lead.name || 'Contact lead'} was archived.`);
  };

  const handleUnarchiveContactLead = (lead) => {
    if (!lead?.id) return;
    const restored = unarchiveContactSubmission({ id: lead.id });
    if (!restored) return;

    setContactLeads((prev) => prev.map((item) => (item.id === lead.id ? restored : item)));
    setLastSyncAt(Date.now());
    setEmailNotice(`${lead.name || 'Contact lead'} was moved back to the inbox.`);
  };

  const handlePermanentDeleteContactLead = async (lead) => {
    if (!lead || !lead.id) return;
    const contactName = String(lead.name || '').trim() || 'this contact lead';
    const confirmedDelete = await requestConfirmation({
      title: 'Permanent Delete',
      message: `Permanently delete ${contactName} from Contact Us messages? This action cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!confirmedDelete) return;

    const removed = deleteContactSubmission({ id: lead.id });
    if (!removed) return;

    setContactLeads((prev) => prev.filter((item) => item.id !== lead.id));
    setOpenedContactIds((prev) => prev.filter((id) => id !== lead.id));
    setSelectedContactLead((prev) => (prev?.id === lead.id ? null : prev));
    setLastSyncAt(Date.now());
    setEmailNotice(`${lead.name || 'Contact lead'} was permanently deleted.`);
  };

  const handleDeleteContactLead = (lead) => {
    if (!lead?.id) return;
    openContactDeleteDialog(lead);
  };

  const profileInitials = useMemo(() => {
    const parts = String(profileName || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return 'A';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
  }, [profileName]);

  const handleOpenProfilePreview = () => {
    setIsProfilePreviewOpen(true);
  };

  const handleCloseProfilePreview = () => {
    setIsProfilePreviewOpen(false);
  };

  const handleEditProfilePicture = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event) => {
    const inputElement = event.target;
    const file = inputElement?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEmailNotice('Please upload a valid image file for the profile picture.');
      inputElement.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setEmailNotice('Profile picture must be 2MB or smaller.');
      inputElement.value = '';
      return;
    }

    let avatarDataUrl = '';
    try {
      avatarDataUrl = await fileToDataUrl(file);
    } catch (error) {
      setEmailNotice(error?.message || 'Unable to read the selected profile image.');
      inputElement.value = '';
      return;
    }

    setProfileAvatarUrl(avatarDataUrl);
    persistProfileLocally({ avatarUrl: avatarDataUrl });
    inputElement.value = '';

    if (!isSupabaseConfigured) {
      setEmailNotice('Profile picture saved locally on this browser.');
      return;
    }

    const usernameForSave =
      String(profileUsername || session?.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;
    const uploadResult = await uploadAdminAvatarToSupabase({
      file,
      username: usernameForSave,
      email: profileEmail,
    });
    if (uploadResult.error) {
      setEmailNotice(
        `Profile picture saved locally only. Avatar upload to bucket failed: ${
          uploadResult.error.message || 'Unknown error.'
        }`
      );
      return;
    }
    const avatarUrlForSave = String(uploadResult.publicUrl || '').trim() || avatarDataUrl;

    const saveResult = await updateAdminProfileInSupabase({
      username: usernameForSave,
      displayName: profileName,
      email: profileEmail,
      avatarUrl: avatarUrlForSave,
    });

    if (saveResult.error) {
      setEmailNotice(
        `Profile picture saved locally only. Supabase sync failed: ${saveResult.error.message || 'Unknown error.'}`
      );
      return;
    }

    if (saveResult.data) {
      const syncedUsername = String(saveResult.data.username || usernameForSave).trim() || usernameForSave;
      const syncedAvatarUrl = String(saveResult.data.avatarUrl || avatarUrlForSave).trim();
      setProfileUsername(syncedUsername);
      setProfileAvatarUrl(syncedAvatarUrl);
      persistProfileLocally({
        username: syncedUsername,
        avatarUrl: syncedAvatarUrl,
      });
      setEmailNotice('Profile picture saved.');
    }
  };

  const openNameEditor = () => {
    setNameDraft(profileName);
    setNameError('');
    setIsEditingName(true);
  };

  const cancelNameEditor = () => {
    setNameDraft(profileName);
    setNameError('');
    setIsEditingName(false);
  };

  const saveNameEditor = async () => {
    const nextName = String(nameDraft || '').trim();
    if (!nextName) {
      setNameError('Display name cannot be empty.');
      return;
    }
    if (nextName.length > 50) {
      setNameError('Display name must be 50 characters or less.');
      return;
    }

    setProfileName(nextName);
    setNameDraft(nextName);
    setNameError('');
    setIsEditingName(false);
    updateStoredSessionProfile({ name: nextName });
    persistProfileLocally({ name: nextName });

    if (!isSupabaseConfigured) {
      setEmailNotice('Display name saved locally on this browser.');
      return;
    }

    const usernameForSave =
      String(profileUsername || session?.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;

    const saveResult = await updateAdminProfileInSupabase({
      username: usernameForSave,
      displayName: nextName,
      email: profileEmail,
      avatarUrl: profileAvatarUrl,
    });

    if (saveResult.error) {
      setEmailNotice(
        `Display name saved locally only. Supabase sync failed: ${saveResult.error.message || 'Unknown error.'}`
      );
      return;
    }

    if (saveResult.data) {
      setProfileUsername(String(saveResult.data.username || usernameForSave).trim() || usernameForSave);
      const syncedName = String(saveResult.data.name || nextName).trim() || nextName;
      setProfileName(syncedName);
      setNameDraft(syncedName);
      updateStoredSessionProfile({ name: syncedName });
      persistProfileLocally({
        username: String(saveResult.data.username || usernameForSave).trim() || usernameForSave,
        name: syncedName,
      });
      setEmailNotice('Display name saved.');
    }
  };

  const openEmailEditor = () => {
    setEmailDraft(profileEmail);
    setProfileEmailError('');
    setIsEditingEmail(true);
  };

  const cancelEmailEditor = () => {
    setEmailDraft(profileEmail);
    setProfileEmailError('');
    setIsEditingEmail(false);
  };

  const saveEmailEditor = async () => {
    const nextEmail = String(emailDraft || '').trim();
    if (!EMAIL_PATTERN.test(nextEmail)) {
      setProfileEmailError('Please enter a valid email address.');
      return;
    }

    if (!isSupabaseConfigured) {
      setProfileEmail(nextEmail);
      setEmailDraft(nextEmail);
      setProfileEmailError('');
      setIsEditingEmail(false);
      updateStoredSessionProfile({ email: nextEmail });
      persistProfileLocally({ email: nextEmail });
      setEmailNotice('Email saved locally on this browser.');
      return;
    }

    const usernameForSave =
      String(profileUsername || session?.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;
    const saveResult = await updateAdminProfileInSupabase({
      username: usernameForSave,
      displayName: profileName,
      email: nextEmail,
      avatarUrl: profileAvatarUrl,
    });

    if (saveResult.error) {
      setProfileEmail(nextEmail);
      setEmailDraft(nextEmail);
      setProfileEmailError('');
      setIsEditingEmail(false);
      updateStoredSessionProfile({ email: nextEmail });
      persistProfileLocally({ email: nextEmail });
      setEmailNotice(
        `Email saved locally only. Supabase sync failed: ${saveResult.error.message || 'Unable to save email address.'}`
      );
      return;
    }

    const persistedEmail = String(saveResult.data?.email || nextEmail).trim() || nextEmail;
    setProfileEmail(persistedEmail);
    setEmailDraft(persistedEmail);
    setProfileEmailError('');
    setIsEditingEmail(false);
    setProfileUsername(String(saveResult.data?.username || usernameForSave).trim() || usernameForSave);
    updateStoredSessionProfile({ email: persistedEmail });
    persistProfileLocally({
      username: String(saveResult.data?.username || usernameForSave).trim() || usernameForSave,
      email: persistedEmail,
    });
    setEmailNotice('Email address saved.');
  };

  const openPasswordModal = () => {
    setPasswordFields({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordFields((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    const nextErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!String(passwordFields.currentPassword || '').trim()) {
      nextErrors.currentPassword = 'Current password is required.';
    }

    if (String(passwordFields.newPassword || '').length < 8) {
      nextErrors.newPassword = 'New password must be at least 8 characters.';
    }

    if (!String(passwordFields.confirmPassword || '').trim()) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (passwordFields.confirmPassword !== passwordFields.newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setPasswordErrors(nextErrors);

    if (nextErrors.currentPassword || nextErrors.newPassword || nextErrors.confirmPassword) {
      return;
    }

    if (!isSupabaseConfigured) {
      setEmailNotice('Password updated for this session only. Connect Supabase to persist it.');
      closePasswordModal();
      return;
    }

    const usernameForSave =
      String(profileUsername || session?.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME;
    const updateResult = await updateAdminPasswordInSupabase({
      username: usernameForSave,
      currentPassword: passwordFields.currentPassword,
      newPassword: passwordFields.newPassword,
    });

    if (updateResult.error) {
      const errorMessage = String(updateResult.error.message || '').trim();
      if (errorMessage.toLowerCase().includes('current password')) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: errorMessage }));
      } else {
        setEmailNotice(`Unable to update password: ${errorMessage || 'Unknown error.'}`);
      }
      return;
    }

    setEmailNotice('Password updated successfully.');
    closePasswordModal();
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
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    const weekStartMs = todayStartMs - 6 * 24 * 60 * 60 * 1000;
    const allLeadRecords = [...joinApplicants, ...contactLeads];
    const totalUsersSet = new Set();
    const weeklyUsersSet = new Set();

    allLeadRecords.forEach((record, index) => {
      const emailKey = String(record?.email || '').trim().toLowerCase();
      const fallbackKey = String(record?.id || `record-${index}`).trim().toLowerCase();
      const userKey = emailKey || fallbackKey;
      totalUsersSet.add(userKey);

      const rawCreated = Number(record?.createdAt);
      const createdAtMs =
        Number.isFinite(rawCreated) && rawCreated > 0
          ? rawCreated
          : Date.parse(String(record?.createdAt || ''));

      if (!Number.isFinite(createdAtMs)) return;
      if (createdAtMs >= weekStartMs && createdAtMs <= now) weeklyUsersSet.add(userKey);
    });

    return [
      { title: 'Total users', value: totalUsersSet.size, meta: `New this week: ${weeklyUsersSet.size}` },
      { title: 'Contact leads', value: applicantCounts.totalContact, meta: 'Who contacted via Contact form' },
      { title: 'Join applicants', value: applicantCounts.totalJoin, meta: `Pending review: ${applicantCounts.pending}` },
      { title: 'Hired applicants', value: applicantCounts.hired, meta: `Rejected: ${applicantCounts.rejected}` },
    ];
  }, [applicantCounts, contactLeads, joinApplicants, openedContactIds]);

  const displayedDashboardJoinApplicants = useMemo(() => {
    if (isShowingAllNewUsers) return joinApplicants;
    return joinApplicants.slice(0, DASHBOARD_NEW_USERS_PREVIEW_LIMIT);
  }, [isShowingAllNewUsers, joinApplicants]);

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
  const scheduleApplicantName = scheduleApplicant
    ? scheduleApplicant.fullName ||
      `${scheduleApplicant.firstName || ''} ${scheduleApplicant.lastName || ''}`.trim() ||
      'Applicant'
    : 'Applicant';
  const scheduleApplicantEmail = scheduleApplicant
    ? String(scheduleApplicant.email || '').trim() || 'No email'
    : 'No email';
  const interviewDateLabel = formatInterviewDateLabel(interviewDate);
  const interviewTimeLabel = formatInterviewTimeLabel(interviewTime);
  const calendarMonthLabel = calendarMonthCursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const scheduleTodayStart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);
  const calendarDayCells = useMemo(() => {
    const monthStart = new Date(calendarMonthCursor.getFullYear(), calendarMonthCursor.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      const dateValue = toDateInputValue(date);
      const isInCurrentMonth = date.getMonth() === calendarMonthCursor.getMonth();
      const isToday = dateValue === toDateInputValue(new Date());
      const isSelected = dateValue === interviewDate;
      const isPastDay = date.getTime() < scheduleTodayStart;

      return {
        key: `${dateValue}-${index}`,
        day: date.getDate(),
        dateValue,
        isInCurrentMonth,
        isToday,
        isSelected,
        isPastDay,
      };
    });
  }, [calendarMonthCursor, interviewDate, scheduleTodayStart]);
  const selectedContactName = selectedContactLead
    ? String(selectedContactLead.name || '').trim() || 'Unnamed contact'
    : '';
  const selectedContactMessage = selectedContactLead
    ? String(selectedContactLead.message || '').trim() || 'No message provided.'
    : '';
  const blockedContactEmailSet = useMemo(
    () =>
      new Set(
        blockedContactEmails
          .map((email) => String(email || '').trim().toLowerCase())
          .filter(Boolean)
      ),
    [blockedContactEmails]
  );
  const contactLeadIsOpened = (lead) => Boolean(lead?.isOpened) || openedContactIds.includes(lead?.id);
  const archivedContactLeads = useMemo(
    () => contactLeads.filter((lead) => Boolean(lead?.isArchived)),
    [contactLeads]
  );
  const activeContactLeads = contactLeads.filter((lead) => {
    const leadEmail = String(lead?.email || '').trim().toLowerCase();
    const isBlockedEmail = leadEmail && blockedContactEmailSet.has(leadEmail);
    return !isBlockedEmail && !lead?.isArchived;
  });
  const unreadContactLeads = activeContactLeads.filter((lead) => !contactLeadIsOpened(lead));
  const readContactLeads = activeContactLeads.filter((lead) => contactLeadIsOpened(lead));
  const displayedUnreadContactLeads = isShowingAllUnreadContactLeads
    ? unreadContactLeads
    : unreadContactLeads.slice(0, CONTACT_MESSAGES_PREVIEW_LIMIT);
  const displayedReadContactLeads = isShowingAllReadContactLeads
    ? readContactLeads
    : readContactLeads.slice(0, CONTACT_MESSAGES_PREVIEW_LIMIT);
  const blockedContactLeadEntries = useMemo(() => {
    return blockedContactEmails.map((email) => {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const matchedLead = contactLeads.find(
        (lead) => String(lead?.email || '').trim().toLowerCase() === normalizedEmail
      );

      return {
        email: normalizedEmail,
        lead: matchedLead || null,
      };
    });
  }, [blockedContactEmails, contactLeads]);
  const totalArchivedEntries = archivedContactLeads.length + blockedContactLeadEntries.length;
  const notReviewedApplicants = joinApplicants.filter(
    (application) => !isApplicantReviewedStatus(application?.status || 'pending')
  );
  const reviewedApplicants = joinApplicants.filter((application) =>
    isApplicantReviewedStatus(application?.status || 'pending')
  );
  const displayedNotReviewedApplicants = isShowingAllNotReviewedApplicants
    ? notReviewedApplicants
    : notReviewedApplicants.slice(0, DASHBOARD_NEW_USERS_PREVIEW_LIMIT);
  const displayedReviewedApplicants = isShowingAllReviewedApplicants
    ? reviewedApplicants
    : reviewedApplicants.slice(0, DASHBOARD_NEW_USERS_PREVIEW_LIMIT);
  const reviewedApplicantsCount = reviewedApplicants.length;
  const notReviewedApplicantsCount = notReviewedApplicants.length;
  const confirmationConfirmButtonClass =
    confirmationDialog.tone === 'danger'
      ? 'border-[#a11e2f]/60 bg-[#5b1220] text-[#ffdce1] hover:bg-[#6f1526]'
      : confirmationDialog.tone === 'success'
        ? 'border-[#0f7150]/60 bg-[#0f5a3f] text-[#d8f5e8] hover:bg-[#136647]'
        : 'border-[#c8922a]/60 bg-[#3f2f0d] text-[#ffe8bf] hover:bg-[#4f3a12]';

  const renderContactLeadCard = (lead) => {
    const isOpened = contactLeadIsOpened(lead);
    const leadEmail = String(lead?.email || '').trim().toLowerCase();
    const isBlockedEmail = Boolean(leadEmail) && blockedContactEmailSet.has(leadEmail);
    const canManageGmailBlock = GMAIL_PATTERN.test(leadEmail);
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
          <div className="min-w-0 flex-1">
            <p className="break-all font-black text-[#163426]">{lead.name || 'Unnamed contact'}</p>
            <p className="break-all text-sm text-[#6f877d]">{lead.email || 'No email'}</p>
          </div>
          <div className="shrink-0 text-right">
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

        <p className="mt-2 break-all text-sm text-[#3d5a4e]">
          {`${messagePreview}${(lead.message || '').length > 96 ? '...' : ''}`}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleViewContactLead(lead)}
            className="rounded-full border border-[#0f7150]/30 bg-[#e8f6ef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#0f5a3f] transition-colors hover:bg-[#daf0e5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            View Message
          </button>
          {isOpened && (
            <>
              <button
                type="button"
                onClick={() => handleReplyToContactLead(lead)}
                className="rounded-full border border-[#c8922a]/45 bg-[#fff6e9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#9a6a13] transition-colors hover:bg-[#fdebcf]"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => handleDeleteContactLead(lead)}
                className="rounded-full border border-[#a11e2f]/45 bg-[#fdecef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#8f1428] transition-colors hover:bg-[#fbdde2]"
              >
                Delete
              </button>
              {canManageGmailBlock && (
                <button
                  type="button"
                  onClick={() =>
                    isBlockedEmail ? handleUnblockContactLeadEmail(lead) : handleBlockContactLeadEmail(lead)
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] transition-colors ${
                    isBlockedEmail
                      ? 'border-[#0f7150]/45 bg-[#e8f6ef] text-[#0f5a3f] hover:bg-[#d9efe4]'
                      : 'border-[#a11e2f]/45 bg-[#fff1f4] text-[#8f1428] hover:bg-[#fde4ea]'
                  }`}
                >
                  {isBlockedEmail ? 'Unblock Gmail' : 'Block Gmail'}
                </button>
              )}
              {isBlockedEmail && (
                <span className="rounded-full border border-[#a11e2f]/45 bg-[#fff1f4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#8f1428]">
                  Blocked
                </span>
              )}
            </>
          )}
          {lead.openedAt && (
            <p className="text-[11px] font-semibold text-[#6f877d]">
              Opened: {formatDateTime(lead.openedAt)}
            </p>
          )}
        </div>
      </article>
    );
  };

  const renderApplicantMobileCard = (application, groupType) => {
    const status = application.status || 'pending';
    const statusLabel = formatApplicantStatusLabel(status);
    const reviewLabel = getApplicantReviewLabel(status);
    const isNotReviewedGroup = groupType === 'not_reviewed';
    const fullName =
      application.fullName ||
      `${application.firstName || ''} ${application.lastName || ''}`.trim() ||
      'Applicant';

    return (
      <article
        key={application.id}
        className={`rounded-xl border p-3 shadow-[0_6px_14px_rgba(14,51,35,0.05)] ${
          isNotReviewedGroup
            ? 'border-[#c8922a]/45 bg-[#fffaf0]'
            : 'border-[#0f7150]/28 bg-[#f4fbf7]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-black text-[#163426]">{fullName}</p>
            <p className="break-all text-sm text-[#6f877d]">{application.email || 'No email'}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.14em] cursor-default select-none ${getApplicantStatusBadgeClass(status)}`}
            >
              {statusLabel}
            </span>
            <span
              className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.14em] cursor-default select-none ${getApplicantReviewBadgeClass(status)}`}
            >
              {reviewLabel}
            </span>
          </div>
        </div>

        <div className="mt-2 space-y-1 text-sm text-[#355146]">
          <p><span className="font-black text-[#163426]">Position:</span> {application.position || 'No position'}</p>
          <p><span className="font-black text-[#163426]">Country:</span> {application.country || 'No country'}</p>
          <p><span className="font-black text-[#163426]">Phone:</span> {application.phoneDisplay || 'No phone number'}</p>
          <p className="break-all"><span className="font-black text-[#163426]">CV:</span> {getCvDisplayName(application.cvFileName)}</p>
          <p className="text-xs text-[#6f877d]">Submitted: {formatDateTime(application.createdAt)}</p>
          {application.reviewedAt && (
            <p className="text-xs text-[#6f877d]">Updated: {formatDateTime(application.reviewedAt)}</p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenApplicantDetails(application)}
            className="rounded-full border border-[#0f5a3f]/35 bg-[#edf5f0] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#0f5a3f] transition-colors hover:bg-[#e0eee7]"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate(application, 'hired')}
            disabled={status === 'hired' || status === 'rejected'}
            className="rounded-full border border-[#0f7150]/45 bg-[#e8f6ef] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#0f5a3f] transition-colors hover:bg-[#d9efe4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleScheduleInterview(application)}
            disabled={status === 'hired' || status === 'rejected'}
            className="rounded-full border border-[#c8922a]/45 bg-[#fff6e9] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#9a6a13] transition-colors hover:bg-[#fdebcf] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate(application, 'rejected')}
            disabled={status === 'rejected'}
            className="rounded-full border border-[#a11e2f]/45 bg-[#fdecef] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#8f1428] transition-colors hover:bg-[#fbdde2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reject
          </button>
          {status === 'rejected' && (
            <button
              type="button"
              onClick={() => handleDeleteRejectedApplication(application)}
              className="rounded-full border border-[#a11e2f]/55 bg-[#fff1f4] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#8f1428] transition-colors hover:bg-[#fde4ea]"
            >
              Delete
            </button>
          )}
        </div>
      </article>
    );
  };

  const renderApplicantDesktopRow = (application, groupType) => {
    const status = application.status || 'pending';
    const statusLabel = formatApplicantStatusLabel(status);
    const reviewLabel = getApplicantReviewLabel(status);
    const isNotReviewedGroup = groupType === 'not_reviewed';
    const fullName =
      application.fullName ||
      `${application.firstName || ''} ${application.lastName || ''}`.trim() ||
      'Applicant';

    return (
      <tr
        key={application.id}
        className={`border-b border-[#dbe4df] last:border-b-0 ${
          isNotReviewedGroup ? 'bg-[#fffaf0]/75' : 'bg-[#f4fbf7]/75'
        }`}
      >
        <td className="px-6 py-4 align-top">
          <p className="font-black text-[#163426]">{fullName}</p>
          <p className="text-sm text-[#6f877d]">{application.email || 'No email'}</p>
          <p className="mt-1 text-[11px] font-semibold text-[#6f877d]">
            Submitted: {formatDateTime(application.createdAt)}
          </p>
          {application.reviewedAt && (
            <p className="text-[11px] font-semibold text-[#6f877d]">
              Updated: {formatDateTime(application.reviewedAt)}
            </p>
          )}
        </td>
        <td className="px-6 py-4 align-top text-center text-[#355146]">
          <p className="font-semibold">{application.position || 'No position'}</p>
          <p className="text-sm text-[#6f877d]">{application.country || 'No country'}</p>
          <p className="text-xs text-[#6f877d]">{application.phoneDisplay || 'No phone number'}</p>
          <p className="text-xs text-[#6f877d]">CV: {getCvDisplayName(application.cvFileName)}</p>
        </td>
        <td className="px-6 py-4 align-top text-center">
          <div className="inline-flex flex-col items-center gap-1">
            <span
              className={`inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em] cursor-default select-none ${getApplicantStatusBadgeClass(status)}`}
            >
              {statusLabel}
            </span>
            <span
              className={`inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em] cursor-default select-none ${getApplicantReviewBadgeClass(status)}`}
            >
              {reviewLabel}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 align-top text-center">
          <button
            type="button"
            onClick={() => handleOpenApplicantDetails(application)}
            className="rounded-full border border-[#0f5a3f]/35 bg-[#edf5f0] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e0eee7]"
          >
            View Details
          </button>
        </td>
        <td className="px-6 py-4 align-top text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleStatusUpdate(application, 'hired')}
              disabled={status === 'hired' || status === 'rejected'}
              className="rounded-full border border-[#0f7150]/45 bg-[#e8f6ef] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#d9efe4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => handleScheduleInterview(application)}
              disabled={status === 'hired' || status === 'rejected'}
              className="rounded-full border border-[#c8922a]/45 bg-[#fff6e9] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#9a6a13] transition-colors hover:bg-[#fdebcf] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={() => handleStatusUpdate(application, 'rejected')}
              disabled={status === 'rejected'}
              className="rounded-full border border-[#a11e2f]/45 bg-[#fdecef] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#8f1428] transition-colors hover:bg-[#fbdde2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
            {status === 'rejected' && (
              <button
                type="button"
                onClick={() => handleDeleteRejectedApplication(application)}
                className="rounded-full border border-[#a11e2f]/55 bg-[#fff1f4] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#8f1428] transition-colors hover:bg-[#fde4ea]"
              >
                Delete
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen" style={adminBgStyle}>
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="relative flex flex-col overflow-x-hidden border-b border-[#e0e5e2] bg-gradient-to-b from-[#0a3e2d] via-[#063124] to-[#032118] px-4 py-5 text-white sm:px-5 sm:py-6 lg:sticky lg:top-0 lg:min-h-screen lg:overflow-y-visible lg:border-r lg:border-b-0">
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

          <nav className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:mt-8 lg:grid-cols-1">
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
                className={`w-full rounded-xl border px-3 py-2.5 text-center transition-all duration-200 sm:py-3 lg:text-left ${
                  (activeView === ADMIN_VIEW_APPLICANTS && item.id === ADMIN_VIEW_APPLICANTS) ||
                  (activeView === ADMIN_VIEW_COURSES && item.id === ADMIN_VIEW_COURSES) ||
                  (activeView === ADMIN_VIEW_DASHBOARD && item.id === ADMIN_VIEW_DASHBOARD)
                    ? 'border-[#ffc370]/55 bg-[#0f5a3f] text-white shadow-[0_8px_18px_rgba(0,0,0,0.2)]'
                    : 'border-transparent bg-white/0 text-white/86 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <p className="text-xs font-extrabold sm:text-sm">{item.label}</p>
                <p className="text-[10px] text-white/70 sm:text-[11px]">{item.hint}</p>
              </button>
            ))}
          </nav>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />

          <button
            type="button"
            onClick={() => setIsAdminProfileOpen((prev) => !prev)}
            className="relative mt-6 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[#c8922a]/45 bg-[linear-gradient(135deg,rgba(4,42,31,0.96)_0%,rgba(15,90,63,0.92)_52%,rgba(4,42,31,0.98)_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#FFB347] shadow-[0_14px_24px_rgba(4,28,19,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e0a93b]/65 hover:shadow-[0_18px_28px_rgba(4,28,19,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] lg:mt-8"
            aria-expanded={isAdminProfileOpen}
            aria-controls="admin-profile-panel"
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_34%),linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_100%)]" />
            <span>Admin Profile</span>
          </button>

          {isAdminProfileOpen && (
            <div
              id="admin-profile-panel"
              className="relative mt-3 rounded-2xl border border-white/35 bg-[#042a1f]/80 p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">Signed In</p>

              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleOpenProfilePreview}
                  className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#c8922a]/70 bg-[#0f5a3f] text-xl font-black text-[#c8922a] transition-colors hover:bg-[#124a33]"
                  aria-label="View profile picture"
                >
                  {profileAvatarUrl ? (
                    <img src={profileAvatarUrl} alt="Admin profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{profileInitials}</span>
                  )}
                </button>
              </div>
              <div className="mt-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleEditProfilePicture}
                  className="rounded-full border border-[#c8922a]/55 bg-[#0f5a3f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#c8922a] transition-colors hover:bg-[#124a33]"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-3 space-y-3">
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/65">Name</p>
                  {isEditingName ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={nameDraft}
                        onChange={(event) => setNameDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            saveNameEditor();
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            cancelNameEditor();
                          }
                        }}
                        maxLength={50}
                        className="w-full rounded-lg border border-white/25 bg-[#0f3a2b] px-2.5 py-1.5 text-sm font-bold text-white outline-none focus:border-[#c8922a]"
                        aria-label="Edit display name"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveNameEditor}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#c8922a]/60 bg-[#0f5a3f] text-sm font-black text-[#c8922a] hover:bg-[#144d36]"
                        aria-label="Save display name"
                      >
                        &#10003;
                      </button>
                      <button
                        type="button"
                        onClick={cancelNameEditor}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/30 bg-transparent text-sm font-black text-white/80 hover:bg-white/10"
                        aria-label="Cancel name edit"
                      >
                        &#10005;
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-base font-black text-white">{profileName}</p>
                      <button
                        type="button"
                        onClick={openNameEditor}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-sm text-[#c8922a] opacity-0 transition-opacity hover:border-white/20 hover:bg-white/10 group-hover:opacity-100"
                        aria-label="Edit display name"
                      >
                        &#9998;
                      </button>
                    </div>
                  )}
                  {nameError && <p className="mt-1 text-[11px] font-semibold text-[#f8b5b5]">{nameError}</p>}
                </div>

                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/65">Email</p>
                  {isEditingEmail ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="email"
                        value={emailDraft}
                        onChange={(event) => {
                          setEmailDraft(event.target.value);
                          setProfileEmailError('');
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            saveEmailEditor();
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            cancelEmailEditor();
                          }
                        }}
                        className="w-full rounded-lg border border-white/25 bg-[#0f3a2b] px-2.5 py-1.5 text-sm font-bold text-white outline-none focus:border-[#c8922a]"
                        aria-label="Edit email"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveEmailEditor}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#c8922a]/60 bg-[#0f5a3f] text-sm font-black text-[#c8922a] hover:bg-[#144d36]"
                        aria-label="Save email"
                      >
                        &#10003;
                      </button>
                      <button
                        type="button"
                        onClick={cancelEmailEditor}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/30 bg-transparent text-sm font-black text-white/80 hover:bg-white/10"
                        aria-label="Cancel email edit"
                      >
                        &#10005;
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 break-all text-xs text-white/75">{profileEmail}</p>
                      <button
                        type="button"
                        onClick={openEmailEditor}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-sm text-[#c8922a] opacity-0 transition-opacity hover:border-white/20 hover:bg-white/10 group-hover:opacity-100"
                        aria-label="Edit email"
                      >
                        &#9998;
                      </button>
                    </div>
                  )}
                  {profileEmailError && (
                    <p className="mt-1 text-[11px] font-semibold text-[#f8b5b5]">{profileEmailError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openPasswordModal}
                  className="text-xs font-black uppercase tracking-[0.1em] text-[#c8922a] underline decoration-[#c8922a]/80 underline-offset-2 hover:text-[#d9a648]"
                >
                  Change Password
                </button>
              </div>

              <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#FFB347]">
                Session expires: {expiryText}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="relative mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#FFB347]/75 bg-[#042a1f] px-4 py-2.5 text-sm font-black uppercase tracking-[0.08em] text-[#FFB347] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0f5a3f] hover:text-white lg:mt-auto"
          >
            Log Out
          </button>
        </aside>

        <main className="relative overflow-hidden px-3 py-4 text-[#1a3a2b] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <video
            src="/videos/12681526_3840_2160_30fps.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,248,0.9)_0%,rgba(243,247,244,0.82)_26%,rgba(239,244,240,0.88)_100%)]" />

          <div className="relative z-10">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#102f22] sm:text-4xl xl:text-5xl">{headerTitle}</h1>
              <p className="mt-1 text-sm font-semibold text-[#4f685e]">{headerSubtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#c1d0c9] bg-white/95 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#1f3d30] shadow-[0_6px_12px_rgba(14,51,35,0.08)] sm:px-5 sm:text-[11px]">
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
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#1e4d3c]">
                    Join Applicants
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.totalJoin}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Submitted from Join Us form</p>
                </article>
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#1e4d3c]">
                    Pending
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.pending}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Awaiting review</p>
                </article>
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#1e4d3c]">
                    Resolved
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.hired + applicantCounts.rejected}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Hired and rejected updates sent</p>
                </article>
              </section>

              <section className="mt-3 grid grid-cols-1 gap-3">
                <article className="mx-1 overflow-hidden rounded-2xl border border-[#d6dfda] bg-white/82 shadow-[0_10px_22px_rgba(14,51,35,0.06)] sm:mx-3">
                  <div className="flex flex-col gap-1 border-b border-[#d6dfda] px-4 py-3 sm:relative sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                    <h2 className="text-center text-2xl font-black leading-tight text-[#102f22] sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:text-3xl">WHO JOINED</h2>
                    <div className="self-end text-right sm:self-auto">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">
                        {joinApplicants.length} Total
                      </span>
                    </div>
                  </div>

                  {joinApplicants.length === 0 ? (
                    <p className="m-5 rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-4 text-sm text-[#6f877d]">
                      No Join Us applications yet.
                    </p>
                  ) : (
                    <>
                    <div className="space-y-4 p-3 sm:p-4 lg:hidden">
                      {notReviewedApplicants.length > 0 && (
                        <div className="rounded-xl border-2 border-[#c8922a]/45 bg-[#fff8ee] p-2">
                          <div className="mb-2 flex items-center justify-between rounded-lg border border-[#c8922a]/35 bg-[#fff1dd] px-2.5 py-1.5">
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9a5a00]">Not Reviewed</p>
                            <div className="flex items-center gap-2">
                              {notReviewedApplicants.length > DASHBOARD_NEW_USERS_PREVIEW_LIMIT &&
                                (isShowingAllNotReviewedApplicants ? (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllNotReviewedApplicants(false)}
                                    className="rounded-full border border-[#c8922a]/45 bg-[#fff8ee] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#9a5a00] transition-colors hover:bg-[#fff1dd]"
                                  >
                                    Back
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllNotReviewedApplicants(true)}
                                    className="rounded-full border border-[#c8922a]/45 bg-[#fff8ee] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#9a5a00] transition-colors hover:bg-[#fff1dd]"
                                  >
                                    View all
                                  </button>
                                ))}
                              <span className="rounded-full border border-[#c8922a]/55 bg-[#fff4df] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#9a5a00]">
                                {notReviewedApplicants.length}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {displayedNotReviewedApplicants.map((application) =>
                              renderApplicantMobileCard(application, 'not_reviewed')
                            )}
                          </div>
                        </div>
                      )}

                      {reviewedApplicants.length > 0 && (
                        <div className="rounded-xl border-2 border-[#0f7150]/35 bg-[#eef9f3] p-2">
                          <div className="mb-2 flex items-center justify-between rounded-lg border border-[#0f7150]/28 bg-[#e2f4ea] px-2.5 py-1.5">
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0f5a3f]">Reviewed</p>
                            <div className="flex items-center gap-2">
                              {reviewedApplicants.length > DASHBOARD_NEW_USERS_PREVIEW_LIMIT &&
                                (isShowingAllReviewedApplicants ? (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllReviewedApplicants(false)}
                                    className="rounded-full border border-[#0f7150]/35 bg-[#eef9f3] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e2f4ea]"
                                  >
                                    Back
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllReviewedApplicants(true)}
                                    className="rounded-full border border-[#0f7150]/35 bg-[#eef9f3] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e2f4ea]"
                                  >
                                    View all
                                  </button>
                                ))}
                              <span className="rounded-full border border-[#0f7150]/35 bg-[#e5f5ee] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0f5a3f]">
                                {reviewedApplicants.length}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {displayedReviewedApplicants.map((application) =>
                              renderApplicantMobileCard(application, 'reviewed')
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hidden overflow-x-auto lg:block">
                      <table className="min-w-[1200px] w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#123f2d] to-[#18583f] text-left text-white">
                            <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-[0.12em]">Applicant</th>
                            <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-[0.12em]">Position</th>
                            <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-[0.12em]">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-[0.12em]">Details</th>
                            <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-[0.12em]">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notReviewedApplicants.length > 0 && (
                            <tr className="bg-gradient-to-r from-[#fff4df] to-[#ffe7c0] border-y border-[#c8922a]/45">
                              <td colSpan={5} className="px-6 py-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9a5a00]">
                                    Not Reviewed ({notReviewedApplicants.length})
                                  </span>
                                  {notReviewedApplicants.length > DASHBOARD_NEW_USERS_PREVIEW_LIMIT &&
                                    (isShowingAllNotReviewedApplicants ? (
                                      <button
                                        type="button"
                                        onClick={() => setIsShowingAllNotReviewedApplicants(false)}
                                        className="rounded-full border border-[#c8922a]/45 bg-[#fff8ee] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#9a5a00] transition-colors hover:bg-[#fff1dd]"
                                      >
                                        Back
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setIsShowingAllNotReviewedApplicants(true)}
                                        className="rounded-full border border-[#c8922a]/45 bg-[#fff8ee] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#9a5a00] transition-colors hover:bg-[#fff1dd]"
                                      >
                                        View all
                                      </button>
                                    ))}
                                </div>
                              </td>
                            </tr>
                          )}
                          {displayedNotReviewedApplicants.map((application) =>
                            renderApplicantDesktopRow(application, 'not_reviewed')
                          )}
                          {reviewedApplicants.length > 0 && (
                            <tr className="bg-gradient-to-r from-[#e5f5ee] to-[#d8efdf] border-y border-[#0f7150]/35">
                              <td colSpan={5} className="px-6 py-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#0f5a3f]">
                                    Reviewed ({reviewedApplicants.length})
                                  </span>
                                  {reviewedApplicants.length > DASHBOARD_NEW_USERS_PREVIEW_LIMIT &&
                                    (isShowingAllReviewedApplicants ? (
                                      <button
                                        type="button"
                                        onClick={() => setIsShowingAllReviewedApplicants(false)}
                                        className="rounded-full border border-[#0f7150]/35 bg-[#eef9f3] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e2f4ea]"
                                      >
                                        Back
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setIsShowingAllReviewedApplicants(true)}
                                        className="rounded-full border border-[#0f7150]/35 bg-[#eef9f3] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0f5a3f] transition-colors hover:bg-[#e2f4ea]"
                                      >
                                        View all
                                      </button>
                                    ))}
                                </div>
                              </td>
                            </tr>
                          )}
                          {displayedReviewedApplicants.map((application) =>
                            renderApplicantDesktopRow(application, 'reviewed')
                          )}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                </article>
              </section>
            </>
          ) : isCoursesView ? (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#1e4d3c]">
                    Contact Leads
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{applicantCounts.totalContact}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Submitted from Contact Us</p>
                </article>
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#1e4d3c]">
                    Opened
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">{readContactLeads.length}</p>
                  <p className="text-xs font-semibold text-[#8aa097]">Read messages</p>
                </article>
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-4 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#1e4d3c]">
                    Archives
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#123424]">
                    {totalArchivedEntries}
                  </p>
                  <p className="text-xs font-semibold text-[#8aa097]">Archived messages and blocked senders</p>
                </article>
              </section>

              <section className="mt-3 grid grid-cols-1 gap-3">
                <article className="rounded-2xl border border-[#d6dfda] bg-white/82 p-5 shadow-[0_10px_22px_rgba(14,51,35,0.06)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-3xl font-black leading-tight text-[#102f22]">Who Contacted</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a]">
                        {contactLeads.length} Total
                      </span>
                      {blockedContactEmails.length > 0 && (
                        <span className="rounded-full border border-[#a11e2f]/45 bg-[#fff1f4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#8f1428]">
                          {blockedContactEmails.length} Blocked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contactLeads.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-4 text-sm text-[#6f877d]">
                        No contact submissions yet.
                      </p>
                    ) : (
                      <>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0f5a3f]">Unread</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#58736a]">
                                {unreadContactLeads.length}
                              </span>
                              {unreadContactLeads.length > CONTACT_MESSAGES_PREVIEW_LIMIT &&
                                (isShowingAllUnreadContactLeads ? (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllUnreadContactLeads(false)}
                                    className="rounded-full border border-[#0e5c3a]/35 bg-[#edf5f0] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0e5c3a] transition-colors hover:bg-[#e2efe8] hover:text-[#123b2b]"
                                  >
                                    Back
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllUnreadContactLeads(true)}
                                    className="rounded-full border border-[#0e5c3a]/35 bg-[#edf5f0] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0e5c3a] transition-colors hover:bg-[#e2efe8] hover:text-[#123b2b]"
                                  >
                                    View all
                                  </button>
                                ))}
                            </div>
                          </div>
                          {unreadContactLeads.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-3 text-sm text-[#6f877d]">
                              No unread messages.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {displayedUnreadContactLeads.map((lead) => renderContactLeadCard(lead))}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#58736a]">OPENED</p>
                            <div className="flex items-center gap-2">
                              {readContactLeads.length > 0 &&
                                (isShowingAllReadContactLeads ? (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllReadContactLeads(false)}
                                    className="rounded-full border border-[#0e5c3a]/35 bg-[#edf5f0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#0e5c3a] shadow-[0_4px_10px_rgba(14,92,58,0.15)] transition-colors hover:bg-[#e2efe8] hover:text-[#123b2b]"
                                  >
                                    Back
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setIsShowingAllReadContactLeads(true)}
                                    className="rounded-full border border-[#0e5c3a]/35 bg-[#edf5f0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#0e5c3a] shadow-[0_4px_10px_rgba(14,92,58,0.15)] transition-colors hover:bg-[#e2efe8] hover:text-[#123b2b]"
                                  >
                                    View all
                                  </button>
                                ))}
                              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#58736a]">
                                {readContactLeads.length}
                              </span>
                            </div>
                          </div>
                          {readContactLeads.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-3 text-sm text-[#6f877d]">
                              No read messages yet.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {displayedReadContactLeads.map((lead) => renderContactLeadCard(lead))}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8f1428]">ARCHIVES</p>
                            <span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8f1428]">
                              {totalArchivedEntries}
                            </span>
                          </div>
                          {totalArchivedEntries === 0 ? (
                            <p className="rounded-xl border border-dashed border-[#d9c2c8] bg-[#fff7f9] p-3 text-sm text-[#7f5a63]">
                              No archived messages or blocked Gmail senders.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {archivedContactLeads.map((lead) => {
                                const leadName = String(lead?.name || '').trim() || 'Archived contact';
                                const leadMessagePreview = String(lead?.message || '').trim();
                                return (
                                  <article
                                    key={`archived-contact-${lead.id}`}
                                    className="rounded-xl border border-[#d7dce6] bg-[#f5f8fc] p-3 shadow-[0_6px_14px_rgba(66,95,130,0.06)]"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="break-all font-black text-[#1e3a5f]">{leadName}</p>
                                        <p className="break-all text-sm text-[#5d748f]">{lead.email || 'No email'}</p>
                                        {leadMessagePreview && (
                                          <p className="mt-1 break-all text-xs text-[#5d748f]">
                                            {`${leadMessagePreview.slice(0, 120)}${
                                              leadMessagePreview.length > 120 ? '...' : ''
                                            }`}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <span className="rounded-full border border-[#406591]/35 bg-[#edf3fb] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#2d527b]">
                                          Archived
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleUnarchiveContactLead(lead)}
                                          className="rounded-full border border-[#0f7150]/45 bg-[#e8f6ef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#0f5a3f] transition-colors hover:bg-[#d9efe4]"
                                        >
                                          Unarchive
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handlePermanentDeleteContactLead(lead)}
                                          className="rounded-full border border-[#a11e2f]/45 bg-[#fff1f4] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#8f1428] transition-colors hover:bg-[#fde4ea]"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </article>
                                );
                              })}
                              {blockedContactLeadEntries.map((entry) => {
                                const leadName = String(entry.lead?.name || '').trim() || 'Blocked sender';
                                const leadMessagePreview = String(entry.lead?.message || '').trim();
                                return (
                                  <article
                                    key={`blocked-contact-${entry.email}`}
                                    className="rounded-xl border border-[#e7c8cf] bg-[#fff4f6] p-3 shadow-[0_6px_14px_rgba(161,30,47,0.06)]"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="break-all font-black text-[#5f1121]">{leadName}</p>
                                        <p className="break-all text-sm text-[#7f5a63]">
                                          {entry.email || 'No email'}
                                        </p>
                                        {leadMessagePreview && (
                                          <p className="mt-1 break-all text-xs text-[#7f5a63]">
                                            {`${leadMessagePreview.slice(0, 120)}${
                                              leadMessagePreview.length > 120 ? '...' : ''
                                            }`}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <span className="rounded-full border border-[#a11e2f]/45 bg-[#fff1f4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#8f1428]">
                                          Blocked
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUnblockContactLeadEmail(
                                              entry.lead || { email: entry.email }
                                            )
                                          }
                                          className="rounded-full border border-[#0f7150]/45 bg-[#e8f6ef] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#0f5a3f] transition-colors hover:bg-[#d9efe4]"
                                        >
                                          Unarchive
                                        </button>
                                      </div>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </article>
              </section>
            </>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

              <section className="mt-3 grid grid-cols-1 gap-3">
                <article className="overflow-hidden rounded-2xl border border-[#c8d4cf] bg-white/94 shadow-[0_10px_22px_rgba(14,51,35,0.08)]">
                  <div className="flex items-center justify-between border-b border-[#d4dfda] px-5 py-4">
                    <h2 className="text-3xl font-black leading-none text-[#0f2f21]">APPLICANTS</h2>
                    {joinApplicants.length > DASHBOARD_NEW_USERS_PREVIEW_LIMIT &&
                      (isShowingAllNewUsers ? (
                        <button
                          type="button"
                          onClick={() => setIsShowingAllNewUsers(false)}
                          className="rounded-xl border border-[#d5ddda] bg-[#f6f8f7] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a] shadow-[0_4px_12px_rgba(14,92,58,0.08)] transition-colors hover:bg-white"
                        >
                          Back
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsShowingAllNewUsers(true)}
                          className="rounded-xl border border-[#d5ddda] bg-[#f6f8f7] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#0e5c3a] shadow-[0_4px_12px_rgba(14,92,58,0.08)] transition-colors hover:bg-white"
                        >
                          View all
                        </button>
                      ))}
                  </div>

                  {displayedDashboardJoinApplicants.length === 0 ? (
                    <p className="m-5 rounded-xl border border-dashed border-[#c8d4cf] bg-[#f8fbf9] p-4 text-sm text-[#6f877d]">
                      No Join Us applicants yet.
                    </p>
                  ) : (
                    <div>
                      {displayedDashboardJoinApplicants.map((applicant, index) => {
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
                        const avatarTone = [
                          'bg-[#0f5a3f] text-[#f4ecd9]',
                          'bg-[#2a724b] text-[#f4ecd9]',
                          'bg-[#c8922a] text-[#fef7e8]',
                          'bg-[#17a06f] text-[#f4ecd9]',
                          'bg-[#996214] text-[#fef7e8]',
                        ][index % 5];

                        return (
                          <div
                            key={applicant.id}
                            className="flex items-center justify-between border-b border-[#d4dfda] px-5 py-4 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${avatarTone}`}
                              >
                                {initials.toUpperCase()}
                              </span>
                              <div>
                                <p className="text-[1.08rem] font-black leading-tight text-[#123424]">{fullName}</p>
                                <p className="text-sm font-medium text-[#7a889f]">{applicant.email || 'No email'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black leading-none text-[#123424]">{recordCode}</p>
                              <p className="mt-1 text-sm font-semibold text-[#6f877d]">{dateText}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>

              </section>
            </>
          )}

          {scheduleApplicant && (
            <div
              className="fixed inset-0 z-[132] flex items-center justify-center bg-[#041c13]/65 px-4 py-6"
              onClick={closeScheduleInterviewModal}
            >
              <article
                className="w-full max-w-lg rounded-2xl border border-[#c6d8cf] bg-[#f8fbf9] p-5 shadow-[0_20px_42px_rgba(4,28,19,0.35)] sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#58736a]">Schedule Interview</p>
                    <h3 className="mt-1 text-2xl font-black text-[#102f22]">{scheduleApplicantName}</h3>
                    <p className="text-sm font-semibold text-[#5f7a6f]">{scheduleApplicantEmail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeScheduleInterviewModal}
                    disabled={isSendingScheduleEmail}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c1d0c9] bg-white text-lg font-black text-[#355146] transition-colors hover:bg-[#edf5f0] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Close schedule interview"
                  >
                    x
                  </button>
                </div>

                <form className="space-y-3" onSubmit={handleScheduleInterviewSubmit}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#58736a]">
                        Interview Date
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCalendarOpen((previous) => !previous);
                          setIsTimePickerOpen(false);
                        }}
                        className="mt-1 inline-flex w-full items-center justify-between rounded-xl border border-[#c8d4cf] bg-white px-3 py-2 text-sm font-semibold text-[#163426] transition-colors hover:bg-[#f5f9f7]"
                        aria-label="Choose interview date"
                      >
                        <span>{interviewDateLabel}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#58736a]">Calendar</span>
                      </button>

                      {isCalendarOpen && (
                        <div className="absolute left-0 top-[calc(100%+0.4rem)] z-[160] w-full overflow-hidden rounded-xl border border-[#c8d4cf] bg-white p-3 shadow-[0_14px_26px_rgba(4,28,19,0.2)]">
                          <div className="mb-3">
                            <label
                              htmlFor="interview-date-input-free"
                              className="text-[10px] font-black uppercase tracking-[0.08em] text-[#58736a]"
                            >
                              Set Interview Date
                            </label>
                            <input
                              id="interview-date-input-free"
                              type="date"
                              min={toDateInputValue(new Date())}
                              value={interviewDate}
                              onChange={(event) => {
                                const nextDate = event.target.value;
                                setInterviewDate(nextDate);
                                setInterviewScheduleError('');

                                const [yearText, monthText] = String(nextDate || '').split('-');
                                const year = Number(yearText);
                                const month = Number(monthText);
                                if (year && month) {
                                  setCalendarMonthCursor(new Date(year, month - 1, 1));
                                }
                              }}
                              className="mt-1 w-full rounded-lg border border-[#c8d4cf] bg-white px-3 py-2 text-sm font-semibold text-[#163426] outline-none transition-colors focus:border-[#0f5a3f] focus:ring-2 focus:ring-[#0f5a3f]/20"
                            />
                          </div>

                          <div className="mb-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleCalendarMonthShift(-1)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#c8d4cf] bg-[#f8fbf9] text-sm font-black text-[#355146] transition-colors hover:bg-[#edf5f0]"
                              aria-label="Previous month"
                            >
                              &lt;
                            </button>
                            <p className="text-sm font-black text-[#123424]">{calendarMonthLabel}</p>
                            <button
                              type="button"
                              onClick={() => handleCalendarMonthShift(1)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#c8d4cf] bg-[#f8fbf9] text-sm font-black text-[#355146] transition-colors hover:bg-[#edf5f0]"
                              aria-label="Next month"
                            >
                              &gt;
                            </button>
                          </div>

                          <div className="mb-1 grid grid-cols-7 gap-1">
                            {INTERVIEW_WEEKDAY_LABELS.map((label) => (
                              <span
                                key={label}
                                className="inline-flex items-center justify-center text-[10px] font-black uppercase tracking-[0.08em] text-[#6f877d]"
                              >
                                {label}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {calendarDayCells.map((cell) => (
                              <button
                                key={cell.key}
                                type="button"
                                disabled={cell.isPastDay}
                                onClick={() => handleSelectInterviewDate(cell.dateValue)}
                                className={`inline-flex h-8 items-center justify-center rounded-md text-xs font-black transition-colors ${
                                  cell.isPastDay
                                    ? 'cursor-not-allowed text-[#b8c7c1]'
                                    : cell.isSelected
                                      ? 'border border-[#0f5a3f]/55 bg-[#0f5a3f] text-[#f5eedb]'
                                      : cell.isToday
                                        ? 'border border-[#c8922a]/55 bg-[#fff3df] text-[#9a5a00] hover:bg-[#ffe9c8]'
                                        : cell.isInCurrentMonth
                                          ? 'text-[#163426] hover:bg-[#edf5f0]'
                                          : 'text-[#95a8a0] hover:bg-[#f3f7f5]'
                                }`}
                              >
                                {cell.day}
                              </button>
                            ))}
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setIsCalendarOpen(false)}
                              className="rounded-md border border-[#c8d4cf] bg-[#f8fbf9] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#355146] transition-colors hover:bg-[#edf5f0]"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#58736a]">
                        Interview Time
                      </label>
                      <input
                        id="interview-time-input-free"
                        type="text"
                        inputMode="text"
                        placeholder="HH:MM AM/PM"
                        value={interviewTimeText}
                        onFocus={() => setIsCalendarOpen(false)}
                        onChange={(event) => {
                          const nextValue = String(event.target.value || '').toUpperCase();
                          setInterviewTimeText(nextValue);
                          const normalized = normalizeInterviewTimeValue(nextValue);
                          if (normalized) {
                            setInterviewTime(normalized);
                          }
                          setInterviewScheduleError('');
                        }}
                        onBlur={() => {
                          const normalized = normalizeInterviewTimeValue(interviewTimeText);
                          if (normalized) {
                            setInterviewTime(normalized);
                            setInterviewTimeText(formatInterviewTimeLabel(normalized));
                          }
                        }}
                        className="mt-1 w-full rounded-xl border border-[#c8d4cf] bg-white px-3 py-2 text-sm font-semibold text-[#163426] outline-none transition-colors focus:border-[#0f5a3f] focus:ring-2 focus:ring-[#0f5a3f]/20"
                      />
                      <p className="mt-1 text-[11px] font-semibold text-[#6f877d]">Selected: {interviewTimeLabel}</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#5f7a6f]">
                    Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time'}
                  </p>

                  {interviewScheduleError && (
                    <p className="text-sm font-semibold text-[#8f1428]">{interviewScheduleError}</p>
                  )}

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeScheduleInterviewModal}
                      disabled={isSendingScheduleEmail}
                      className="rounded-full border border-[#c1d0c9] bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#355146] transition-colors hover:bg-[#edf5f0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingScheduleEmail}
                      className="rounded-full border border-[#c8922a]/55 bg-[#fff2de] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#9a6a13] transition-colors hover:bg-[#fce8c7] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingScheduleEmail ? 'Sending...' : 'Send Interview Schedule'}
                    </button>
                  </div>
                </form>
              </article>
            </div>
          )}

          {selectedContactLead && (
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center bg-[#041c13]/65 px-4 py-6"
              onClick={handleCloseContactLeadDetails}
            >
              <article
                className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#c6d8cf] bg-[#f8fbf9] p-5 shadow-[0_20px_42px_rgba(4,28,19,0.35)] sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#58736a]">
                      Contact Details
                    </p>
                    <h3 className="mt-1 text-3xl font-black text-[#102f22]">{selectedContactName}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#5f7a6f]">
                      Submitted: {formatDateTime(selectedContactLead.createdAt)}
                    </p>
                    {selectedContactLead.openedAt && (
                      <p className="text-sm font-semibold text-[#5f7a6f]">
                        Opened: {formatDateTime(selectedContactLead.openedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
                        selectedContactLead.isOpened || openedContactIds.includes(selectedContactLead.id)
                          ? 'border-[#bfd3c9] bg-[#f4f8f6] text-[#426156]'
                          : 'border-[#0f7150]/35 bg-[#e0f3ea] text-[#0f5a3f]'
                      }`}
                    >
                      {selectedContactLead.isOpened || openedContactIds.includes(selectedContactLead.id)
                        ? 'Opened'
                        : 'Unread'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCloseContactLeadDetails}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c1d0c9] bg-white text-lg font-black text-[#355146] transition-colors hover:bg-[#edf5f0]"
                      aria-label="Close details"
                    >
                      x
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Name</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedContactName}</p>
                  </div>
                  <div className="rounded-xl border border-[#d5e1db] bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Email</p>
                    <p className="mt-1 font-bold text-[#163426]">{selectedContactLead.email || 'No email'}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-[#d5e1db] bg-white p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6f877d]">Message</p>
                  <p className="mt-1 whitespace-pre-wrap break-all text-sm leading-relaxed text-[#163426]">
                    {selectedContactMessage}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleReplyToContactLead(selectedContactLead)}
                    className="rounded-full border border-[#c8922a]/45 bg-[#fff6e9] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#9a6a13] transition-colors hover:bg-[#fdebcf]"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContactLead(selectedContactLead)}
                    className="rounded-full border border-[#a11e2f]/55 bg-[#fff1f4] px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#8f1428] transition-colors hover:bg-[#fde4ea]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            </div>
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
                      className={`inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em] cursor-default select-none ${getApplicantStatusBadgeClass(
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
          </div>
        </main>
      </section>

      {isProfilePreviewOpen && (
        <div
          className="fixed inset-0 z-[145] flex items-center justify-center bg-[#041c13]/72 px-4 py-6"
          onClick={handleCloseProfilePreview}
        >
          <article
            className="w-full max-w-xl rounded-2xl border border-white/55 bg-white/28 p-5 text-[#123424] shadow-[0_20px_42px_rgba(4,28,19,0.3)] backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#123424]">Profile Picture</h3>
              <button
                type="button"
                onClick={handleCloseProfilePreview}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#123424]/25 text-sm font-black text-[#123424]/85 hover:bg-white/35"
                aria-label="Close profile picture preview"
              >
                x
              </button>
            </div>

            <div className="flex justify-center">
              {profileAvatarUrl ? (
                <img
                  src={profileAvatarUrl}
                  alt="Admin profile preview"
                  className="max-h-[70vh] w-auto max-w-full rounded-xl border border-[#c8922a]/70 bg-white object-contain"
                />
              ) : (
                <div className="inline-flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border border-[#c8922a]/70 bg-[#0f5a3f] text-5xl font-black text-[#c8922a]">
                  <span>{profileInitials}</span>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {contactDeleteDialog.isOpen && (
        <div
          className="fixed inset-0 z-[146] flex items-center justify-center bg-[#041c13]/72 px-4 py-6"
          onClick={closeContactDeleteDialog}
        >
          <article
            className="w-full max-w-md rounded-2xl border border-[#c8922a]/45 bg-[#0b2f22] p-5 text-white shadow-[0_20px_42px_rgba(4,28,19,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-black text-white">Choose Contact Action</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/80">
              {`Select an action for ${
                String(contactDeleteDialog.lead?.name || '').trim() || 'this contact lead'
              }.`}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const lead = contactDeleteDialog.lead;
                  closeContactDeleteDialog();
                  if (lead) {
                    void handlePermanentDeleteContactLead(lead);
                  }
                }}
                className="rounded-lg border border-[#a11e2f]/60 bg-[#5b1220] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#ffdce1] transition-colors hover:bg-[#6f1526]"
              >
                Remove Permanently
              </button>
              <button
                type="button"
                onClick={() => {
                  const lead = contactDeleteDialog.lead;
                  closeContactDeleteDialog();
                  if (lead) {
                    handleArchiveContactLead(lead);
                  }
                }}
                className="rounded-lg border border-[#0f7150]/60 bg-[#0f5a3f] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#d8f5e8] transition-colors hover:bg-[#136647]"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={closeContactDeleteDialog}
                className="rounded-lg border border-white/25 bg-transparent px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </article>
        </div>
      )}

      {confirmationDialog.isOpen && (
        <div
          className="fixed inset-0 z-[147] flex items-center justify-center bg-[#041c13]/72 px-4 py-6"
          onClick={() => closeConfirmationDialog(false)}
        >
          <article
            className="w-full max-w-md rounded-2xl border border-[#c8922a]/45 bg-[#0b2f22] p-5 text-white shadow-[0_20px_42px_rgba(4,28,19,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-black text-white">{confirmationDialog.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/80">
              {confirmationDialog.message}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => closeConfirmationDialog(false)}
                className="rounded-lg border border-white/25 bg-transparent px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => closeConfirmationDialog(true)}
                className={`rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition-colors ${confirmationConfirmButtonClass}`}
              >
                {confirmationDialog.confirmLabel}
              </button>
            </div>
          </article>
        </div>
      )}

      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-[#041c13]/70 px-4 py-6"
          onClick={closePasswordModal}
        >
          <article
            className="w-full max-w-md rounded-2xl border border-[#c8922a]/45 bg-[#0b2f22] p-5 text-white shadow-[0_20px_42px_rgba(4,28,19,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-black text-white">Change Password</h3>
            <p className="mt-1 text-xs font-semibold text-white/70">Update your admin password securely.</p>

            <form className="mt-4 space-y-3" onSubmit={handlePasswordUpdate}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/70" htmlFor="admin-current-password">
                  Current Password
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="admin-current-password"
                    type={passwordVisibility.currentPassword ? 'text' : 'password'}
                    value={passwordFields.currentPassword}
                    onChange={(event) => handlePasswordFieldChange('currentPassword', event.target.value)}
                    className="w-full rounded-lg border border-white/25 bg-[#124334] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#c8922a]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    className="rounded-md border border-[#c8922a]/45 bg-[#0f5a3f] px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#c8922a] hover:bg-[#144d36]"
                  >
                    {passwordVisibility.currentPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs font-semibold text-[#f8b5b5]">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/70" htmlFor="admin-new-password">
                  New Password
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="admin-new-password"
                    type={passwordVisibility.newPassword ? 'text' : 'password'}
                    value={passwordFields.newPassword}
                    onChange={(event) => handlePasswordFieldChange('newPassword', event.target.value)}
                    className="w-full rounded-lg border border-white/25 bg-[#124334] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#c8922a]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="rounded-md border border-[#c8922a]/45 bg-[#0f5a3f] px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#c8922a] hover:bg-[#144d36]"
                  >
                    {passwordVisibility.newPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs font-semibold text-[#f8b5b5]">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/70" htmlFor="admin-confirm-password">
                  Confirm New Password
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    id="admin-confirm-password"
                    type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                    value={passwordFields.confirmPassword}
                    onChange={(event) => handlePasswordFieldChange('confirmPassword', event.target.value)}
                    className="w-full rounded-lg border border-white/25 bg-[#124334] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#c8922a]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="rounded-md border border-[#c8922a]/45 bg-[#0f5a3f] px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#c8922a] hover:bg-[#144d36]"
                  >
                    {passwordVisibility.confirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs font-semibold text-[#f8b5b5]">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="rounded-lg border border-white/25 bg-transparent px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-[#c8922a]/60 bg-[#0f5a3f] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#c8922a] transition-colors hover:bg-[#144d36]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </div>
  );
};

const AdminPortal = () => {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === '/admin/login') return <AdminLoginView />;
  if (pathname === '/admin/forgot-password') return <AdminForgotPasswordView />;
  if (pathname === '/admin/reset-password') return <AdminResetPasswordView />;
  return <AdminDashboardView />;
};

export default AdminPortal;
